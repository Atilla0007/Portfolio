# Deployment

This project is prepared for a traditional host/VPS deployment without Docker.

Canonical domain:

- `https://atilahatefi.ir`

Alternate domain:

- `https://www.atilahatefi.ir`

Canonical redirect target:

- `https://atilahatefi.ir`

## Architecture

Use one public origin:

```text
https://atilahatefi.ir/        -> React build from frontend/dist
https://atilahatefi.ir/api/    -> Django REST API on Gunicorn
https://atilahatefi.ir/go-to-settings/ -> Django admin on Gunicorn
https://atilahatefi.ir/health/ -> Django health endpoint
https://atilahatefi.ir/static/ -> Django collected static files
https://atilahatefi.ir/media/  -> persistent uploaded certificate media
```

Django does not serve the React app directly. The host or Nginx should serve `frontend/dist` for frontend routes and proxy backend routes to Gunicorn.

## Required Software

- Python 3.14 compatible runtime
- Node.js 24 compatible runtime
- PostgreSQL
- Nginx or an equivalent trusted reverse proxy
- Gunicorn
- A process manager such as systemd, Supervisor, or the hosting provider's app runner

## Key Files

- Django settings module: `portfolio_backend.settings`
- WSGI target: `portfolio_backend.wsgi:application`
- Gunicorn config: `deploy/gunicorn.conf.py`
- Nginx TLS example: `deploy/nginx-tls.example.conf`
- Production env template: `.env.production.example`
- CI workflow: `.github/workflows/ci.yml`

## Environment Variables

Copy `.env.production.example` to an untracked production env file on the host and replace placeholders.

Important values:

```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=replace-with-a-long-random-production-secret
DJANGO_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir
DJANGO_CSRF_TRUSTED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir
DJANGO_CORS_ALLOWED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir
DATABASE_URL=postgresql://portfolio:replace-with-strong-database-password@127.0.0.1:5432/portfolio
DJANGO_MEDIA_ROOT=/srv/portfolio/shared/media
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_USE_X_FORWARDED_PROTO=True
DJANGO_HSTS_SECONDS=0
```

Set `DJANGO_USE_X_FORWARDED_PROTO=True` only when the reverse proxy is trusted and overwrites `X-Forwarded-Proto`.

## Build And Release

From the project root on the host:

```bash
cd /srv/portfolio/current

python -m venv backend/.venv
cd backend
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r ../requirements.txt
deactivate

cd ../frontend
npm ci
npm run test --if-present
npm run build

cd ../backend
source .venv/bin/activate
python manage.py check
python manage.py test
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
```

Do not run `makemigrations` automatically during production startup.

## Gunicorn

Run Django through Gunicorn, not `runserver`.

```bash
cd /srv/portfolio/current/backend
source .venv/bin/activate
gunicorn portfolio_backend.wsgi:application --config ../deploy/gunicorn.conf.py
```

Recommended environment:

```env
GUNICORN_BIND=127.0.0.1:8000
GUNICORN_WORKERS=3
GUNICORN_TIMEOUT=60
```

Use systemd/Supervisor/your host panel to keep Gunicorn running.

## Nginx

Use `deploy/nginx-tls.example.conf` as the host-side starting point.

It should:

- serve `frontend/dist`
- proxy `/api/`, `/go-to-settings/`, and `/health/` to Gunicorn
- serve `/static/` from `backend/staticfiles`
- serve `/media/` from persistent media storage
- redirect HTTP to HTTPS
- redirect `www.atilahatefi.ir` to `https://atilahatefi.ir`
- keep SPA fallback away from `/api/`, `/go-to-settings/`, `/static/`, `/media/`, and `/health/`
- deny hidden files, env files, database dumps, and private keys

Never store TLS private keys in this repository.

## Media Persistence

Uploaded certificate images/PDFs must survive deployments.

Recommended layout:

```text
/srv/portfolio/current        -> current release
/srv/portfolio/shared/media   -> persistent uploaded media
/srv/portfolio/releases       -> previous releases for rollback
```

Set:

```env
DJANGO_MEDIA_ROOT=/srv/portfolio/shared/media
```

Back up media together with the database.

## First Admin

Create the first admin manually:

```bash
cd /srv/portfolio/current/backend
source .venv/bin/activate
python manage.py createsuperuser
deactivate
```

## Health Check

Endpoint:

```text
/health/
```

Expected body:

```json
{"status":"ok"}
```

Set `DJANGO_HEALTH_CHECK_DATABASE=True` if you want this endpoint to verify database connectivity.

## Production-Like Local Verification

Use local placeholder values only:

```bash
cd backend
source .venv/bin/activate
DJANGO_DEBUG=False \
DJANGO_SECRET_KEY=local-production-like-placeholder \
DJANGO_ALLOWED_HOSTS=atilahatefi.ir,localhost,127.0.0.1 \
DJANGO_CSRF_TRUSTED_ORIGINS=https://atilahatefi.ir,http://127.0.0.1:8000 \
DATABASE_URL=postgresql://portfolio:local-password@127.0.0.1:5432/portfolio \
DJANGO_SECURE_SSL_REDIRECT=False \
DJANGO_HSTS_SECONDS=0 \
python manage.py check --deploy
deactivate
```

Then verify:

```bash
curl -I https://atilahatefi.ir/
curl -I https://atilahatefi.ir/health/
curl https://atilahatefi.ir/api/certificates/
```

For local frontend-only checks:

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/404
```

## Update Or Redeploy

1. Upload or fetch the new release.
2. Install Python dependencies.
3. Install frontend dependencies with `npm ci`.
4. Build React with `npm run build`.
5. Run Django checks and tests.
6. Back up the database.
7. Back up media or verify media snapshots.
8. Run `python manage.py migrate`.
9. Run `python manage.py collectstatic --noinput`.
10. Restart Gunicorn.
11. Test and reload Nginx.
12. Run health checks and smoke tests.

## Backup

Database:

```bash
pg_dump "$DATABASE_URL" > database-backups/portfolio-YYYYMMDD-HHMMSS.sql
```

Media:

```bash
rsync -a "$DJANGO_MEDIA_ROOT/" media-backups/portfolio-media-YYYYMMDD-HHMMSS/
```

Keep backups encrypted and outside the repository.

## Manual Hosting Actions Still Required

- DNS changes for apex and `www`.
- TLS certificate issuing and renewal.
- Real production secret creation.
- PostgreSQL database/user creation.
- Persistent media directory setup.
- Reverse proxy installation/reload.
- Gunicorn service setup.
- First production superuser creation.
- Backup scheduling and restore testing.
- Monitoring and log retention setup.
