---
name: "Coolify, Docker, and Proxmox"
description: "Orchestrate self-hosted services on Brian's Proxmox box via Coolify API. Deploy Docker containers, manage environment variables, restart services, and provision new services. REQUIRES USER CONFIRMATION on first use per project — ask before touching production infrastructure. 70+ services already running."
layer: "capability-pack"
canonical-owner-of:
  - "coolify-api-interaction"
  - "docker-service-deployment"
  - "self-hosted-orchestration"
---

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

### Proxmox Host
Brian's Proxmox box runs Coolify as the PaaS layer. Coolify manages 70+ Docker services.

### Coolify Access
- **URL:** https://coolify.megabyte.space
- **API:** https://coolify.megabyte.space/api/v1/
- **Token:** `~/.config/emdash/coolify-token`

### Already-Running Services (skill 26 has the full list)

| Service | URL | Status |
|---------|-----|--------|
| **Sentry** | sentry.megabyte.space | Mandatory for all projects |
| **PostHog** | posthog.megabyte.space | Mandatory for all projects |
| **Postiz** | postiz.megabyte.space | Social automation |
| **Listmonk** | listmonk.megabyte.space | Email marketing |
| **n8n** | n8n.megabyte.space | Workflow automation |
| **SearXNG** | searxng.megabyte.space | Self-hosted search |
| **FireCrawl** | firecrawl.megabyte.space | Web scraping |
| **Browserless** | browserless.megabyte.space | Headless Chrome |
| **Authentik** | authentik.megabyte.space | SSO/Identity |
| **Home Assistant** | connect.tomy.house | Home automation |

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
