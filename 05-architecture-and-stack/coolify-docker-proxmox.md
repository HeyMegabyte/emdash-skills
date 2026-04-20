---
name: "Coolify, Docker, and Proxmox"
description: "Orchestrate self-hosted services on Brian's Proxmox box via Coolify API. Deploy Docker containers, manage environment variables, restart services, and provision new services. REQUIRES USER CONFIRMATION on first use per project — ask before touching production infrastructure. 70+ services already running."---

# Coolify, Docker, and Proxmox

> Self-hosted infrastructure for what Cloudflare can't do. Ask before touching.

---

## CRITICAL: First-Use Confirmation Required

**Before using this skill for the first time in any project, ALWAYS ask:**

```
Hey — this project needs [service/capability] which runs on your Proxmox
box via Coolify. I'll need to:

  [specific action: deploy a new service / configure an existing one / etc.]

This touches your production self-hosted infrastructure (70+ services).
Want me to go ahead?
```

**Wait for explicit "yes" before proceeding.** After first confirmation per project, subsequent Coolify operations in the same project don't need re-confirmation unless they:
- Deploy a NEW service (not just configure an existing one)
- Delete or restart an existing service
- Change environment variables on a shared service
- Modify DNS or networking

---

## Infrastructure Overview

### Proxmox Host (361 conversations about Proxmox in ChatGPT history)
Brian's Proxmox box runs Coolify as the PaaS layer. Coolify manages 70+ Docker services.
- Hardware: Bare metal Proxmox with ZFS (rpool) storage + Intel Optane SLOG/SPECIAL
- VMs: OPNsense, Ubuntu Desktop, macOS, Windows 11, Home Assistant OS, Coolify server
- Backup: Daily ZFS snapshots -> zstd compress -> R2 via custom zfs-r2 script
- Secondary: PBS -> R2 + Wasabi (3-2-1 pattern)
- Network: VLAN segmentation (172.20.x.x), 10+ VLANs

### OPNsense (250 conversations)
- Virtualized on Proxmox as primary firewall/router
- VPN: NordVPN + Mullvad (WireGuard), ProtonVPN (OpenVPN), Cloudflare WARP
- DNS: Unbound with DNSSEC + DNS-over-TLS to Cloudflare
- ACME: Let's Encrypt via Cloudflare DNS challenge for *.megabyte.space
- Authentik LDAP integration for authentication
- Headscale for mesh VPN coordination

### Coolify Access (136 mentions — THE hub)
- **URL:** https://coolify.megabyte.space
- **API:** https://coolify.megabyte.space/api/v1/
- **Token:** `~/.config/emdash/coolify-token`
- Behind: Cloudflare tunnel (cloudflared) for zero-trust access
- Reverse proxy: Traefik with Authentik forward-auth middleware
- Docker-compose conventions: SERVICE_FQDN_*, SERVICE_URL_* magic variables

### Already-Running Services (ranked by usage from 3,102 ChatGPT conversations)

| Service | URL | Usage Rank | Status |
|---------|-----|-----------|--------|
| **Authentik** | authentik.megabyte.space | #1 (64x) | SSO for everything |
| **Healthchecks** | healthchecks.megabyte.space | #2 (41x) | Uptime monitoring |
| **OpenWebUI** | openwebui.megabyte.space | #3 (38x) | AI chat interface |
| **Bolt.diy** | bolt.megabyte.space | #4 (35x) | AI website builder |
| **Dify** | dify.megabyte.space | #5 (32x) | AI app builder |
| **Postiz** | postiz.megabyte.space | #6 (32x) | Social automation |
| **n8n** | n8n.megabyte.space | #7 (27x) | Workflow automation |
| **NocoDB** | nocodb.megabyte.space | #8 (25x) | Database UI |
| **Windmill** | windmill.megabyte.space | #9 (24x) | Dev automation |
| **Chatwoot** | chatwoot.megabyte.space | #10 (18x) | Customer chat |
| **Sentry** | sentry.megabyte.space | Mandatory | Error tracking |
| **PostHog** | posthog.megabyte.space | Mandatory | Product analytics |
| **Netdata** | netdata.megabyte.space | - | Server monitoring |
| **FireCrawl** | firecrawl.megabyte.space | - | Web scraping |
| **Listmonk** | listmonk.megabyte.space | - | Email marketing |
| **SearXNG** | searxng.megabyte.space | - | Self-hosted search |
| **Browserless** | browserless.megabyte.space | - | Headless Chrome |
| **Home Assistant** | (internal) | - | Smart home |

### Common Coolify Problems (from debugging sessions)
1. Healthcheck failures in Docker compose (10+ conversations)
2. Container file permissions (9999:root pattern)
3. Redirect loops: Cloudflare -> Authentik -> Service
4. Port conflicts between containers
5. Volume permission issues
6. TLS handshake timeouts

---

## Coolify API Reference

### Authentication
```bash
COOLIFY_TOKEN=$(cat ~/.config/emdash/coolify-token)
COOLIFY_URL="https://coolify.megabyte.space/api/v1"
```

### List All Services
```bash
curl -s "$COOLIFY_URL/services" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" | jq '.[].name'
```

### Get Service Details
```bash
curl -s "$COOLIFY_URL/services/{service_id}" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" | jq '{name, status, fqdn}'
```

### Get Environment Variables
```bash
curl -s "$COOLIFY_URL/services/{service_id}/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" | jq '.[].key'
```

### Set Environment Variable
```bash
# CONFIRMATION REQUIRED for shared services
curl -X POST "$COOLIFY_URL/services/{service_id}/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "ENV_NAME", "value": "env_value", "is_build_time": false}'
```

### Restart Service
```bash
# CONFIRMATION REQUIRED
curl -X POST "$COOLIFY_URL/services/{service_id}/restart" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"
```

### Deploy New Service
```bash
# CONFIRMATION REQUIRED — always ask first
curl -X POST "$COOLIFY_URL/services" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "service-name",
    "type": "docker-compose",
    "docker_compose": "version: \"3\"\nservices:\n  app:\n    image: service:latest\n    ports:\n      - \"8080:8080\"",
    "server_id": 1
  }'
```

### Check Service Health
```bash
curl -s "$COOLIFY_URL/services/{service_id}" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" | jq '.status'
```

---

## When to Use Coolify vs Cloudflare

| Need | Use Cloudflare | Use Coolify |
|------|---------------|-------------|
| API endpoints | Workers (Hono) | — |
| Static sites | Pages | — |
| SQLite database | D1 | — |
| Object storage | R2 | — |
| Key-value cache | KV | — |
| Stateful connections | Durable Objects | — |
| Docker containers | CF Containers | Coolify (more control) |
| PostgreSQL | Neon (managed) | Coolify (self-hosted) |
| Long-running processes | Queues + Workers | Coolify |
| Full-stack apps (Django, Rails, etc.) | — | Coolify |
| Services needing persistent disk | — | Coolify |
| Services needing > 128MB RAM | — | Coolify |
| Custom networking | — | Coolify |

**Rule:** Default to Cloudflare. Use Coolify only when CF genuinely can't handle it.

---

## Docker Compose Patterns

### Simple Service
```yaml
version: "3"
services:
  app:
    image: service/image:latest
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://...
      - SECRET_KEY=${SECRET_KEY}
    ports:
      - "8080:8080"
    volumes:
      - data:/app/data
volumes:
  data:
```

### Service with PostgreSQL
```yaml
version: "3"
services:
  app:
    image: service/image:latest
    restart: unless-stopped
    depends_on: [db]
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=app
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

---

## Disaster Recovery for Self-Hosted Services

### Backup Strategy
- Coolify auto-backs up configurations
- PostgreSQL databases: `pg_dump` via cron to R2
- Volumes: periodic tar to R2
- Environment variables: exported and stored encrypted

### Recovery
```bash
# 1. Restore Coolify from backup
# 2. Re-deploy services from docker-compose configs
# 3. Restore database from pg_dump
# 4. Restore volumes from R2 tarballs
# 5. Verify all services healthy
```

See skill 40 (Backup and Disaster Recovery) for the full single-zip restore plan.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Service unreachable | Check `curl $COOLIFY_URL/services/{id}` status |
| Container restarting | Check logs: `docker logs {container_id}` via Coolify UI |
| Out of memory | Scale up Proxmox VM or optimize service config |
| Disk full | Clean Docker: `docker system prune -a` |
| SSL cert expired | Coolify auto-renews via Let's Encrypt; check Traefik logs |
| API timeout | Coolify may be overloaded; check Proxmox CPU/RAM |

---

## What This Skill Owns
- Coolify API interaction
- Docker service deployment and management
- Self-hosted service orchestration
- Proxmox infrastructure awareness
- When-to-use-Coolify decision logic

## What This Skill Must Never Own
- Cloudflare Workers deployment (→ 08)
- Application code (→ 06)
- Testing (→ 07)
- DNS for CF-hosted sites (→ 23)
