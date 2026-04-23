---
name: "Data Tables"
version: "2.0.0"
updated: "2026-04-23"
description: "AG Grid (ag-grid-angular) for complex data tables with server-side row model, Hono API pagination, column definitions, filtering, sorting, cell renderers, infinite scroll for 100K+ rows, and CSV/Excel export. Angular 20 standalone + signals integration."
---

# Data Tables
## Angular AG Grid Setup
```typescript
// data-table.component.ts
import { Component, input, signal, viewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridReadyEvent, IServerSideDatasource, IServerSideGetRowsParams, GridApi } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { CsvExportModule, ExcelExportModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule, CsvExportModule, ExcelExportModule]);

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar">
      <input type="text" placeholder="Search..." (input)="onSearch($event)" />
      <button (click)="exportCsv()">Export CSV</button>
      <button (click)="exportExcel()">Export Excel</button>
    </div>
    <ag-grid-angular
      style="width: 100%; height: 600px;"
      class="ag-theme-alpine-dark"
      [columnDefs]="columnDefs()"
      [defaultColDef]="defaultColDef"
      [rowModelType]="'serverSide'"
      [pagination]="true"
      [paginationPageSize]="50"
      [cacheBlockSize]="50"
      [animateRows]="true"
      (gridReady)="onGridReady($event)"
    />
  `,
})
export class DataTableComponent {
  readonly endpoint = input('/api/data');
  readonly columnDefs = input<ColDef[]>([]);

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    minWidth: 100,
  };

  private gridApi = signal<GridApi | undefined>(undefined);

  onGridReady(params: GridReadyEvent): void {
    this.gridApi.set(params.api);
    params.api.setGridOption('serverSideDatasource', this.createDatasource());
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.gridApi()?.setGridOption('quickFilterText', value);
  }

  exportCsv(): void { this.gridApi()?.exportDataAsCsv(); }
  exportExcel(): void { this.gridApi()?.exportDataAsExcel(); }

  private createDatasource(): IServerSideDatasource {
    const endpoint = this.endpoint;
    return {
      getRows: async (params: IServerSideGetRowsParams) => {
        const { startRow, endRow, sortModel, filterModel } = params.request;
        const query = new URLSearchParams({
          offset: String(startRow ?? 0),
          limit: String((endRow ?? 50) - (startRow ?? 0)),
          sort: JSON.stringify(sortModel),
          filter: JSON.stringify(filterModel),
        });

        try {
          const res = await fetch(`${endpoint}?${query}`);
          const { rows, totalCount } = await res.json();
          params.success({ rowData: rows, rowCount: totalCount });
        } catch {
          params.fail();
        }
      },
    };
  }
}
```

## Hono Server-Side Pagination API
```typescript
// src/routes/data.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const data = new Hono<{ Bindings: Env }>();

const querySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  sort: z.string().optional(),
  filter: z.string().optional(),
  search: z.string().optional(),
});

data.get('/', zValidator('query', querySchema), async (c) => {
  const { offset, limit, sort, filter, search } = c.req.valid('query');

  let query = 'SELECT * FROM items';
  let countQuery = 'SELECT COUNT(*) as total FROM items';
  const conditions: string[] = [];
  const bindings: unknown[] = [];

  // Search
  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    bindings.push(`%${search}%`, `%${search}%`);
  }

  // AG Grid filter model
  if (filter) {
    const filters = JSON.parse(filter) as Record<string, { filterType: string; type: string; filter: unknown }>;
    for (const [col, f] of Object.entries(filters)) {
      if (f.filterType === 'text') {
        switch (f.type) {
          case 'contains': conditions.push(`${col} LIKE ?`); bindings.push(`%${f.filter}%`); break;
          case 'equals': conditions.push(`${col} = ?`); bindings.push(f.filter); break;
          case 'startsWith': conditions.push(`${col} LIKE ?`); bindings.push(`${f.filter}%`); break;
        }
      } else if (f.filterType === 'number') {
        switch (f.type) {
          case 'equals': conditions.push(`${col} = ?`); bindings.push(f.filter); break;
          case 'greaterThan': conditions.push(`${col} > ?`); bindings.push(f.filter); break;
          case 'lessThan': conditions.push(`${col} < ?`); bindings.push(f.filter); break;
        }
      }
    }
  }

  if (conditions.length) {
    const where = ` WHERE ${conditions.join(' AND ')}`;
    query += where;
    countQuery += where;
  }

  // AG Grid sort model
  if (sort) {
    const sorts = JSON.parse(sort) as Array<{ colId: string; sort: 'asc' | 'desc' }>;
    if (sorts.length) {
      query += ` ORDER BY ${sorts.map((s) => `${s.colId} ${s.sort}`).join(', ')}`;
    }
  }

  query += ' LIMIT ? OFFSET ?';
  bindings.push(limit, offset);

  const [rows, countResult] = await Promise.all([
    c.env.DB.prepare(query).bind(...bindings).all(),
    c.env.DB.prepare(countQuery).bind(...bindings.slice(0, -2)).first(),
  ]);

  return c.json({ rows: rows.results, totalCount: (countResult as { total: number }).total });
});

export { data };
```

## Column Definition Patterns
```typescript
const columnDefs: ColDef[] = [
  { field: 'id', headerName: 'ID', width: 80, hide: true },
  { field: 'name', headerName: 'Name', flex: 2, filter: 'agTextColumnFilter' },
  { field: 'email', headerName: 'Email', flex: 2 },
  { field: 'status', headerName: 'Status', width: 120,
    cellRenderer: (params: { value: string }) => {
      const colors: Record<string, string> = { active: '#00E5FF', inactive: '#666', pending: '#7C3AED' };
      return `<span style="color:${colors[params.value] || '#fff'}">${params.value}</span>`;
    },
    filter: 'agSetColumnFilter',
  },
  { field: 'amount', headerName: 'Amount', width: 120, type: 'numericColumn',
    valueFormatter: (p) => p.value ? `$${p.value.toLocaleString()}` : '—',
  },
  { field: 'createdAt', headerName: 'Created', width: 160,
    valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString() : '',
    filter: 'agDateColumnFilter',
  },
  { headerName: 'Actions', width: 100, sortable: false, filter: false,
    cellRenderer: (params: { data: { id: string } }) =>
      `<button data-action="edit" data-id="${params.data.id}">Edit</button>`,
  },
];
```

## Infinite Scroll (no pagination)
```typescript
// Replace pagination with infinite scroll
<ag-grid-angular
  [rowModelType]="'serverSide'"
  [pagination]="false"
  [cacheBlockSize]="100"
  [maxBlocksInCache]="10"
  [rowBuffer]="20"
/>
// Server returns rows in blocks, grid fetches next block on scroll
```

## Print Layout
```typescript
printTable(): void {
  this.gridApi.setDomLayout('print');
  setTimeout(() => {
    window.print();
    this.gridApi.setDomLayout('normal');
  }, 200);
}
```

## Theming (dark-first)
```css
.ag-theme-alpine-dark {
  --ag-background-color: #060610;
  --ag-header-background-color: #0a0a1a;
  --ag-odd-row-background-color: #0d0d1f;
  --ag-row-hover-color: rgba(0, 229, 255, 0.05);
  --ag-selected-row-background-color: rgba(0, 229, 255, 0.1);
  --ag-font-family: 'Space Grotesk', sans-serif;
  --ag-border-color: rgba(255, 255, 255, 0.08);
}
```
