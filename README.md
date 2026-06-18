# Atila Hatefi Portfolio

Personal portfolio for `atilahatefi.ir`, built with Django REST Framework and React/Vite.

## What It Includes

- React portfolio homepage with About, Certificates, Contact, and custom 404 views.
- Django REST API for public certificates and contact tickets.
- Standard Django admin at `/go-to-settings/` for certificates, contact tickets, users, and future registered models.
- Production-ready settings for PostgreSQL, Gunicorn, Nginx, HTTPS, static files, media uploads, and health checks.

## Project Structure

```text
backend/                  Django project and API
frontend/                 React/Vite app
deploy/gunicorn.conf.py   Gunicorn config
deploy/nginx-tls.example.conf
.env.example              local development env template
.env.production.example   production env template
requirements.txt          Python dependencies
```

Generated/private files such as `.env`, virtualenvs, SQLite databases, media uploads, `frontend/dist`, `node_modules`, staticfiles, security reports, and `graphify-out` are intentionally ignored.

## Local Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend URLs:

```text
http://127.0.0.1:8000/api/certificates/
http://127.0.0.1:8000/api/tickets/
http://127.0.0.1:8000/health/
http://127.0.0.1:8000/go-to-settings/
```

## Local Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

The Vite dev server proxies `/api` and `/media` to Django.

## Environment

Use `.env.example` for local development if your shell or host loads env files.

Production must use real secret values outside Git. Start from `.env.production.example` and set at least:

```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=replace-with-a-real-secret
DJANGO_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir,.atilahatefi.ir
DJANGO_PROJECT_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir,.atilahatefi.ir
DJANGO_CSRF_TRUSTED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir
DJANGO_CORS_ALLOWED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir
DATABASE_URL=postgresql://portfolio:password@127.0.0.1:5432/portfolio
DJANGO_MEDIA_ROOT=/srv/portfolio/shared/media
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_USE_X_FORWARDED_PROTO=True
DJANGO_HSTS_SECONDS=0
VITE_API_BASE_URL=
```

Keep `VITE_API_BASE_URL` empty for same-origin production so the frontend calls `/api/` relatively.

## Data Management

Certificates are public only when `is_visible=True`. Contact form submissions create contact tickets and can be reviewed in Django admin.

Uploaded certificate files are stored under Django media storage. In production, media must be persistent across releases and backed up with the database.

## Verification

Backend:

```bash
cd backend
source .venv/bin/activate
python manage.py check
python manage.py test
python manage.py makemigrations --check --dry-run
python manage.py collectstatic --noinput --dry-run
python -m pip check
deactivate
```

Frontend:

```bash
cd frontend
npm ci
npm run test --if-present
npm run build
```

Security checks:

```bash
gitleaks dir . --redact
semgrep scan --config p/default --metrics=off .
```

## Production Deployment

The simplest cPanel deployment is a single Django Python app on `atilahatefi.ir`.
Django serves the built React files from `frontend/dist`, and also serves the API,
admin, health check, and uploaded media:

```text
https://atilahatefi.ir/                React portfolio served by Django
https://atilahatefi.ir/cv              React client route served by Django
https://atilahatefi.ir/api/            Django API
https://atilahatefi.ir/go-to-settings/ Django admin
https://atilahatefi.ir/health/         Django health endpoint
https://atilahatefi.ir/static/         collected Django/admin static files
https://atilahatefi.ir/assets/         Vite build assets from frontend/dist
https://atilahatefi.ir/media/          uploaded media
```

For cPanel, create one Python app:

```text
Application root: Portfolio/backend
Application URL: atilahatefi.ir
Startup file: passenger_wsgi.py
Application entry point: application
```

Build the frontend before restarting the Python app:

```bash
cd ~/Portfolio
git pull origin main

cd frontend
source /home/styrair/nodevenv/Portfolio/frontend/22/bin/activate
npm install
npm run build

cd ../backend
source /home/styrair/virtualenv/Portfolio/backend/3.11/bin/activate
python -m pip install --upgrade pip
python -m pip install -r ../requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py check
```

Use these cPanel Python app environment variables, replacing the secret:

```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DJANGO_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir,.atilahatefi.ir
DJANGO_PROJECT_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir,.atilahatefi.ir
DJANGO_CSRF_TRUSTED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir
DJANGO_CORS_ALLOWED_ORIGINS=
DATABASE_URL=sqlite:////home/styrair/Portfolio/backend/db.sqlite3
DJANGO_MEDIA_ROOT=/home/styrair/Portfolio/backend/media
FRONTEND_DIST_DIR=/home/styrair/Portfolio/frontend/dist
DJANGO_SECURE_SSL_REDIRECT=False
DJANGO_USE_X_FORWARDED_PROTO=True
DJANGO_ENABLE_WHITENOISE=True
DJANGO_USE_MANIFEST_STATICFILES=True
VITE_API_BASE_URL=
```

If cPanel does not pass environment variables reliably to Passenger, create a
private `backend/.env` file on the server with the same values. This file is
ignored by Git:

```bash
cat > ~/Portfolio/backend/.env <<'EOF'
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=replace-with-a-long-random-secret
DJANGO_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir,.atilahatefi.ir
DJANGO_PROJECT_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir,.atilahatefi.ir
DJANGO_CSRF_TRUSTED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir
DJANGO_CORS_ALLOWED_ORIGINS=
DATABASE_URL=sqlite:////home/styrair/Portfolio/backend/db.sqlite3
DJANGO_MEDIA_ROOT=/home/styrair/Portfolio/backend/media
FRONTEND_DIST_DIR=/home/styrair/Portfolio/frontend/dist
DJANGO_SECURE_SSL_REDIRECT=False
DJANGO_USE_X_FORWARDED_PROTO=True
DJANGO_ENABLE_WHITENOISE=True
DJANGO_USE_MANIFEST_STATICFILES=True
EOF
chmod 600 ~/Portfolio/backend/.env
```

After changing environment variables, click **Restart** in cPanel's Python app.
Verify with:

```bash
curl -I https://atilahatefi.ir/
curl -I https://atilahatefi.ir/health/
curl https://atilahatefi.ir/api/blog/
```

Do not copy `frontend/dist` into `public_html` for this setup. The Python app
serves `frontend/dist` directly. If Passenger shows "Web application could not
be started", check the generated startup log:

```bash
cat ~/Portfolio/backend/passenger_startup_error.log
zgrep -a -n -C 25 "Error ID" ~/logs/*.gz 2>/dev/null
```

For VPS deployment, a traditional setup still works:

- PostgreSQL
- Gunicorn serving `portfolio_backend.wsgi:application`
- Nginx or equivalent reverse proxy
- TLS for `atilahatefi.ir` and `www.atilahatefi.ir`
- Process manager such as systemd, Supervisor, or the host's app runner

Release commands:

```bash
cd /srv/portfolio/current

python -m venv backend/.venv
cd backend
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r ../requirements.txt
python manage.py check
python manage.py test
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

cd ../frontend
npm ci
npm run test --if-present
npm run build
```

Run Gunicorn:

```bash
cd /srv/portfolio/current/backend
source .venv/bin/activate
gunicorn portfolio_backend.wsgi:application --config ../deploy/gunicorn.conf.py
```

Use `deploy/nginx-tls.example.conf` as the reverse proxy starting point. It should serve `frontend/dist`, proxy `/api/`, `/go-to-settings/`, and `/health/`, serve `/static/` and `/media/`, redirect HTTP to HTTPS, redirect `www` to the apex domain, and prevent access to hidden files, env files, databases, dumps, private keys, and source directories.

## Backups And Rollback

Back up PostgreSQL and media before releases:

```bash
pg_dump "$DATABASE_URL" > database-backups/portfolio-YYYYMMDD-HHMMSS.sql
rsync -a "$DJANGO_MEDIA_ROOT/" media-backups/portfolio-media-YYYYMMDD-HHMMSS/
```

Keep backups encrypted and outside the repository.

For rollback, switch the host back to the previous release directory, restart Gunicorn, reload Nginx, and verify:

```bash
curl -I https://atilahatefi.ir/
curl -I https://atilahatefi.ir/health/
curl -I https://atilahatefi.ir/go-to-settings/
curl https://atilahatefi.ir/api/certificates/
```

Do not reverse destructive migrations unless a tested database backup exists.

## Security Notes

- Never commit real `.env` files, credentials, databases, media uploads, private keys, or security reports.
- Use PostgreSQL in production; SQLite is only for local development and tests.
- Start with `DJANGO_HSTS_SECONDS=0`, then increase only after HTTPS and redirects are verified.
- Set `DJANGO_USE_X_FORWARDED_PROTO=True` only behind a trusted proxy that overwrites `X-Forwarded-Proto`.
- Create the first production admin manually with `python manage.py createsuperuser`.
