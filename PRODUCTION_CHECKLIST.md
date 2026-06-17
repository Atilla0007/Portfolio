# Production Checklist

## DNS And TLS

- [ ] Apex `atilahatefi.ir` points to the production host.
- [ ] `www.atilahatefi.ir` points to the production host.
- [ ] TLS certificate covers both names.
- [ ] Certificate renewal is tested.
- [ ] HTTP redirects to HTTPS after TLS is ready.
- [ ] `www.atilahatefi.ir` redirects to `https://atilahatefi.ir`.
- [ ] Redirects do not loop behind the reverse proxy.

## Environment

- [ ] `DJANGO_DEBUG=False`.
- [ ] `DJANGO_SECRET_KEY` is a real secret stored outside Git.
- [ ] `DJANGO_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir`.
- [ ] `DJANGO_CSRF_TRUSTED_ORIGINS` contains both HTTPS origins.
- [ ] `DJANGO_CORS_ALLOWED_ORIGINS` is exact or empty for same-origin only.
- [ ] `DATABASE_URL` points to PostgreSQL, not SQLite.
- [ ] `DJANGO_SECURE_SSL_REDIRECT=True`.
- [ ] `DJANGO_USE_X_FORWARDED_PROTO=True` only behind a trusted proxy.
- [ ] Secure session and CSRF cookies are enabled.

## Database

- [ ] PostgreSQL database exists.
- [ ] Database credentials are stored in environment/secret manager only.
- [ ] `python manage.py makemigrations --check --dry-run` passes.
- [ ] `python manage.py migrate --plan` is reviewed.
- [ ] `python manage.py migrate` is run during release.
- [ ] Database backups are scheduled.
- [ ] Restore procedure has been tested.

## Static Files And Frontend

- [ ] `npm ci` succeeds.
- [ ] `npm run test --if-present` succeeds.
- [ ] `npm run build` succeeds.
- [ ] `frontend/dist` contains no development hosts or secrets.
- [ ] `python manage.py collectstatic --noinput` succeeds.
- [ ] `/static/` serves Django admin CSS and JavaScript.
- [ ] SPA fallback serves frontend routes.
- [ ] SPA fallback does not intercept `/api/`, `/go-to-settings/`, `/static/`, `/media/`, or `/health/`.

## Media

- [ ] `DJANGO_MEDIA_ROOT` points to persistent storage.
- [ ] `/media/` serves uploaded certificate files over HTTPS.
- [ ] Directory listing is disabled.
- [ ] Media storage is not executable.
- [ ] Media backups are scheduled.
- [ ] Restore procedure has been tested.

## Admin And API

- [ ] `/go-to-settings/` loads over HTTPS.
- [ ] First admin is created manually with `createsuperuser`.
- [ ] Admin session cookies are secure.
- [ ] `/api/certificates/` returns public JSON.
- [ ] Hidden certificates are not exposed.
- [ ] Anonymous certificate writes are rejected.
- [ ] Contact tickets can be created through `/api/tickets/`.
- [ ] Ticket throttling is active.

## Security

- [ ] Production tracebacks are not exposed.
- [ ] Source files are not served by the web server.
- [ ] `.env`, `.git`, `.security-reports`, databases, and private keys are blocked.
- [ ] Content-type sniffing protection is enabled.
- [ ] Clickjacking protection is enabled.
- [ ] Referrer policy is set.
- [ ] No mixed-content asset URLs exist.
- [ ] CSP is reviewed as a post-deployment hardening task after testing.
- [ ] Gitleaks scan passes.
- [ ] Semgrep scan passes or documented false positives are reviewed.
- [ ] Snyk dependency scan passes.
- [ ] Snyk Code scan passes if authenticated service access is available.
- [ ] Bearer scan passes.

## Logging, Monitoring, And Health

- [ ] Logs go to stdout/stderr.
- [ ] Logs do not include passwords, cookies, auth headers, CSRF tokens, or env dumps.
- [ ] Host log retention and rotation are configured.
- [ ] `/health/` returns `{"status":"ok"}`.
- [ ] Database health check mode is enabled only when desired.
- [ ] Monitoring alerts cover uptime, 5xx rate, disk usage, database, and backups.

## HSTS Rollout

- [ ] Start with `DJANGO_HSTS_SECONDS=0`.
- [ ] After HTTPS verification, set `DJANGO_HSTS_SECONDS=3600`.
- [ ] After stable operation, set `DJANGO_HSTS_SECONDS=31536000`.
- [ ] `DJANGO_HSTS_INCLUDE_SUBDOMAINS=True` only after every subdomain is permanent HTTPS.
- [ ] `DJANGO_HSTS_PRELOAD=True` only after preload requirements are intentionally accepted.
