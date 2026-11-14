# Docker development environment

Runs the whole Campus Match stack locally with one command: Next.js frontend, Spring Boot backend and a
throwaway PostgreSQL database. Nothing here touches production (the hosted Neon database) or any
PostgreSQL service installed on your PC.

| Service    | Image / runtime                                         | Container port | Open on the host                                  |
| ---------- | ------------------------------------------------------- | -------------: | ------------------------------------------------- |
| `frontend` | Node 22, pnpm 10.18.3, Next.js 16 (`pnpm dev --webpack`) |          3000 | http://localhost:3000                             |
| `backend`  | Java 25 (Temurin JRE), Gradle 9.9.1, Spring Boot 4.1.2  |           8080 | http://localhost:8080/api/health                  |
| `db`       | `postgres:18`, database `campus_match_dev`              |           5432 | `localhost:5433` (host 5432 is left to your own PostgreSQL) |

All ports are published on `127.0.0.1` only.

## 1. Prerequisites (Windows 11)

- Docker Desktop with the **WSL 2** backend, running (whale icon in the tray says "Engine running").
- This repository on a drive Docker Desktop can share (default: all local drives).
- Free host ports **3000**, **5433** and **8080**. Check with:

  ```powershell
  Get-NetTCPConnection -LocalPort 3000,5433,8080 -State Listen -ErrorAction SilentlyContinue
  ```

  No output means all three are free.

## 2. One-time setup: create `.env.docker`

From the repository root:

```powershell
Copy-Item .env.docker.example .env.docker
notepad .env.docker
```

Replace every `<placeholder>`. Generate each random value with:

```powershell
$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); -join ($b | ForEach-Object { $_.ToString('x2') })
```

- `DB_PASSWORD`: password of the Docker database (letters and digits only).
- `JWT_SECRET`: at least 32 bytes of randomness.
- `SSO_ASSERTION_SECRET`: at least 32 bytes and **different** from `JWT_SECRET` (the backend refuses to start otherwise).
  The frontend server signs with it and the backend verifies with it; it never reaches the browser.
- `FACTCHAT_API_KEY`: optional. Leave empty to run without group translation.

`.env.docker` is gitignored. Use development-only values here, never the production ones. Your existing
`.env` / `.env.local` files are not read by this setup.

## 3. Start

```powershell
docker compose up --build
```

Add `-d` to run in the background. The services start in order: `db` (healthy) → `backend` (healthy) →
`frontend`. The first build downloads the Gradle distribution and the npm packages, so allow a few minutes;
later builds reuse the Docker layer cache. The first page load compiles the app (about 10 s); later starts take
under 20 s. Then open http://localhost:3000.

```powershell
docker compose ps
```

## 4. Logs

```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## 5. Restart or rebuild one service

```powershell
docker compose restart backend
docker compose restart frontend
```

`restart` re-runs the existing image. After changing code it does not pick up, rebuild just that service:

```powershell
docker compose up -d --build backend
```

- **Frontend source** (`frontend/src`, `frontend/public`) is bind-mounted and hot-reloads within a few seconds. Windows
  bind mounts deliver no file events to Linux containers, so the dev server polls (`WATCHPACK_POLLING`). The container
  runs `next dev --webpack`: with Next.js 16.3.5 the default Turbopack server found new files over the bind mount but
  did not recompile edited ones. `pnpm dev` on your own machine still uses Turbopack.
- **Frontend `package.json`, lockfile and config files** (`next.config.ts`, `tsconfig.json`, ...) are baked into the image:
  run `docker compose up -d --build frontend` after changing them. Dependencies live in the
  `campus_match_dev_frontend_node_modules` volume and are resynced on start.
- **Backend** has no hot reload: rebuild it after Java changes.

## 6. Stop, and keep your data

```powershell
docker compose stop        # stop containers, keep them
docker compose down        # remove containers and the network; the database volume is KEPT
docker compose up -d       # start again: your data is still there
```

The database lives in the named volume `campus_match_dev_postgres_data`. `stop` and `down` shut PostgreSQL
down cleanly (it is given up to 60 s). **Do not add `-v`**: `docker compose down -v` deletes the volumes and
with them every row in the Docker database.

## 7. How the pieces talk to each other

```
Browser (Windows) ──► http://localhost:3000          Next.js (frontend container)
Browser (Windows) ──► http://localhost:8080/api/...  backend (REST calls from the browser, CORS allows :3000)
Next.js BFF       ──► http://backend:8080            backend (server-to-server, Docker DNS; u-SAINT login)
backend           ──► jdbc:postgresql://db:5432/campus_match_dev
```

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api` is for code running in the browser.
- `SPRING_BOOT_API_URL=http://backend:8080` is for the Next.js server (BFF route handlers) only.
- `DB_URL` is fixed in `compose.yaml`, so the backend cannot be pointed at another database through `.env.docker`.
- The backend runs `ddl-auto: update` and the SSU catalog sync on startup. Both write only to the Docker database.
  The catalog sync may also read public pages from `ssu.ac.kr`.

Connect a SQL client to the Docker database with host `localhost`, port `5433`, database `campus_match_dev`,
user `postgres` and your `DB_PASSWORD`.

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `error during connect ... dockerDesktopLinuxEngine` | Docker Desktop is not running. Start it and wait for "Engine running". |
| `env file ... .env.docker not found` | Do step 2. |
| `port is already allocated` / `address already in use` | Another program or container uses 3000, 5433 or 8080. Find it with `Get-NetTCPConnection -LocalPort 3000 -State Listen` and `docker ps`, then stop that one (for another compose project: `docker compose stop` in that project). Do not stop your own PostgreSQL on 5432: this stack does not use that port. |
| Backend exits with `password authentication failed for user "postgres"` | `DB_PASSWORD` was changed after the database volume was first created; PostgreSQL only reads it on first initialization. Restore the old value in `.env.docker`, or change the password inside the database: `docker compose exec db psql -U postgres -c "ALTER USER postgres PASSWORD '<new>'"`. Only if you do not need the data, delete the volume yourself: `docker compose down` then `docker volume rm campus_match_dev_postgres_data`. |
| Backend exits with `sso.assertion.secret must be at least 32 bytes` or `... must not be the same as jwt.secret` | Fix `SSO_ASSERTION_SECRET` in `.env.docker` (32+ bytes, different from `JWT_SECRET`) and run `docker compose up -d backend`. If it is left empty the backend still starts but rejects every login (fail closed): the log says `SSO assertion verification is DISABLED`. |
| Login fails now and then; the backend log shows `Rejected SSO bridge request: reason=EXPIRED` | The Windows clock is wrong. The SSO assertion lives only 30 s, and when Windows is off from real time, Docker's VM clock jumps by that offset every 5 s (Hyper-V time sync) for a fraction of a second, so an assertion can look expired. Check: `Get-Service w32time` (should be `Running`) and compare `Get-Date -AsUTC` with a trusted clock. Fix: Settings → Time & language → Date & time → **Sync now**, or in an elevated PowerShell `Start-Service w32time; w32tm /resync`. Do not widen the backend's `sso.assertion.clock-skew-seconds` to work around it. |
| u-SAINT login returns a server error | Check `docker compose logs backend frontend`. The container needs internet access to reach the university portal, and the secrets must be set in `.env.docker`. |
| `docker compose ps` shows `starting` for a while | The frontend compiles on its first request; the backend needs about 30-60 s. Wait for `healthy`. |
| Frontend edits do not appear | Confirm the file is under `frontend/src` or `frontend/public`; check `docker compose logs -f frontend`. For other files, rebuild (see step 5). |
| Dependencies look stale | `docker compose up -d --build frontend` (re-runs `pnpm install --frozen-lockfile` into the volume). |
| Need a completely fresh frontend dependency volume | `docker compose down`, then `docker volume rm campus_match_dev_frontend_node_modules campus_match_dev_frontend_next` (this does not touch the database). |
| `Get-NetTCPConnection` shows `com.docker.backend` on a port | That is Docker's port proxy for some container. Use `docker ps` to see which one. |
