# Docker Quick-Start

Runs the full platform — PostgreSQL 16, Spring Boot backend, Next.js frontend — in three containers.

## 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) or Docker Engine + Compose v2
- ~4 GB free RAM (Postgres + JVM + Node)
- ~2 GB disk for images on first build

## 2. Setup

```cmd
copy .env.docker.example .env
```

Then edit `.env` and fill in real values (DB password, JWT secret, Groq/Cashfree/Google keys, SMTP credentials).

> Never commit `.env` — it is already excluded via `.dockerignore` and `.gitignore`.

## 3. Build + Run

```cmd
docker-compose up --build
```

First build downloads Maven + npm dependencies — takes several minutes. Subsequent builds are cached.

## 4. Access

| Service  | URL |
|----------|--------------------------|
| Frontend | http://localhost:3000   |
| Backend  | http://localhost:8080    |
| Postgres | localhost:5432           |

The frontend proxies `/api/*` to the backend inside the Docker network (`http://backend:8080`), so browser calls never need a host override.

## 5. Common commands

```cmd
docker-compose down                     :: stop everything (keeps DB volume)
docker-compose down -v                  :: stop + DELETE the database volume
docker-compose up --build backend       :: rebuild only the backend
docker-compose logs -f backend          :: tail backend logs
docker exec -it dd-backend sh           :: shell into the backend container
docker ps                               :: check container health states
```

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| Port already in use | Find it with `netstat -ano \| findstr :3000` (or `:8080`), or change the host port in `docker-compose.yml` (e.g. `"3001:3000"`) |
| First build is slow | Normal — Maven/npm dependency caches populate on the first build only |
| Backend says it can't reach postgres | The compose healthcheck waits for `pg_isready` before starting the backend (adds ~10–15 s) — it will recover on its own; check `docker-compose logs backend` if not |
| Frontend API calls fail (502/ECONNREFUSED) | Backend not healthy yet — wait for `dd-backend` to show `healthy` in `docker ps` |
| Backend exits with "JWT_SECRET not set" | Your `.env` is missing — copy `.env.docker.example` and fill values |
