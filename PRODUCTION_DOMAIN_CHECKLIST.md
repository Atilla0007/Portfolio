# Production Domain Checklist

Canonical production site:

- Primary: `https://atilahatefi.ir`
- Alternate: `https://www.atilahatefi.ir`

## Architecture

Use a same-origin deployment:

- `/` serves the built React app from `frontend/dist`.
- `/api/` proxies to the Django backend.
- `/go-to-settings/` proxies to the Django backend admin.
- `/media/` serves uploaded media from Django's media storage.

Do not expose the repository root as a public web directory. The public web root should be the React build output plus explicitly configured static/media locations only.

## Canonical Redirects

Configure canonical redirects at the hosting layer or reverse proxy:

- `http://atilahatefi.ir/*` -> `https://atilahatefi.ir/*`
- `http://www.atilahatefi.ir/*` -> `https://atilahatefi.ir/*`
- `https://www.atilahatefi.ir/*` -> `https://atilahatefi.ir/*`

Keep these redirects outside Django when possible. Django can still enforce HTTPS with `DJANGO_SECURE_SSL_REDIRECT=True`, but the apex/www canonical redirect belongs in the proxy or hosting platform to avoid proxy/Django redirect loops.

## TLS

Install certificates that cover both names:

- `atilahatefi.ir`
- `www.atilahatefi.ir`

Verify renewal before enabling long HSTS.

## Django Environment

Use real production values. Do not commit `.env` files or secrets.

```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=replace-with-a-long-random-production-secret
DJANGO_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir
DJANGO_CSRF_TRUSTED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir
DJANGO_CORS_ALLOWED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir
DATABASE_URL=postgresql://portfolio:replace-with-strong-database-password@127.0.0.1:5432/portfolio
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_USE_X_FORWARDED_PROTO=False
DJANGO_HSTS_SECONDS=0
DJANGO_HSTS_INCLUDE_SUBDOMAINS=False
DJANGO_HSTS_PRELOAD=False
```

Set `DJANGO_USE_X_FORWARDED_PROTO=True` only when the reverse proxy reliably sends `X-Forwarded-Proto: https` for HTTPS requests. If that header is missing or user-controlled, leave it disabled.

## HSTS Rollout

Use staged HSTS:

1. Initial deployment: `DJANGO_HSTS_SECONDS=0`.
2. After HTTPS, redirects, admin, API, media, and certificate renewal are verified: `DJANGO_HSTS_SECONDS=3600`.
3. After stable production operation: `DJANGO_HSTS_SECONDS=31536000`.

Keep these disabled until every current and future subdomain is permanently HTTPS:

```env
DJANGO_HSTS_INCLUDE_SUBDOMAINS=False
DJANGO_HSTS_PRELOAD=False
```

Do not submit the domain to the HSTS preload list until the subdomain requirement has been intentionally accepted.

## Frontend

Production frontend API calls should remain relative:

- `/api/certificates/`
- `/api/tickets/`

Leave `VITE_API_BASE_URL` unset for same-origin production. The Vite dev proxy can keep using `127.0.0.1:8000` for local development only.

The React HTML includes the canonical URL and Open Graph URL for `https://atilahatefi.ir/`.

## Static And Media

Django static output is configured with:

- `STATIC_URL=/static/`
- `STATIC_ROOT=backend/staticfiles`
- WhiteNoise compressed manifest static storage when `DJANGO_DEBUG=False` or `DJANGO_USE_MANIFEST_STATICFILES=True`

Deployment should run:

```bash
cd backend
source .venv/bin/activate
python manage.py collectstatic --noinput
python manage.py migrate
```

Serve generated Django static files, React build files, and uploaded media from explicit directories only. Block public access to:

- `.env`, `.env.*`
- `.git/`
- `.security-reports/`
- `SECURITY_AUDIT.md`
- `backend/.venv/`, `backend/venv/`
- `backend/db.sqlite3`
- `backend/staticfiles/` source listing
- `frontend/src/`
- `frontend/node_modules/`
- `frontend/dist/assets/*.map` if source maps are ever enabled
- Python, JavaScript, config, and report source files outside the intended static build

Certificate uploads are validated by file size, filename path safety, extension, and content checks. Serve `/media/` over HTTPS and avoid directory listings.

## Admin And API Checks

After deployment, verify:

- `https://atilahatefi.ir/` loads the React app.
- `https://atilahatefi.ir/go-to-settings/` loads the standard Django admin.
- `https://atilahatefi.ir/api/certificates/` returns JSON.
- The contact form creates tickets at `/api/tickets/`.
- Admin session cookies are secure over HTTPS.
- Hidden certificates do not appear in the public API.
- Anonymous users cannot write certificates.

Future Django models registered with `admin.site.register(...)` or `@admin.register(...)` should appear in the same admin interface automatically.

## Database

Production must use PostgreSQL through `DATABASE_URL`. SQLite remains available only for local development and tests.

## Commands Run On 2026-06-17

Backend local checks:

```bash
cd backend
source .venv/bin/activate
python manage.py check
python manage.py test
python manage.py collectstatic --noinput --dry-run
python -m pip check
```

Result: system check passed, 13 Django tests passed, `collectstatic` found 167 static files for `backend/staticfiles`, and `pip check` reported no broken requirements.

Production-like Django deploy check:

```bash
DJANGO_DEBUG=False \
DJANGO_SECRET_KEY=deploy-check-placeholder-secret-value-with-more-than-fifty-unique-chars-72941 \
DJANGO_ALLOWED_HOSTS=atilahatefi.ir,www.atilahatefi.ir \
DJANGO_CSRF_TRUSTED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir \
DJANGO_CORS_ALLOWED_ORIGINS=https://atilahatefi.ir,https://www.atilahatefi.ir \
DATABASE_URL=postgresql://portfolio:placeholder-password@localhost:5432/portfolio \
DJANGO_SECURE_SSL_REDIRECT=True \
DJANGO_USE_X_FORWARDED_PROTO=True \
DJANGO_USE_MANIFEST_STATICFILES=True \
DJANGO_HSTS_SECONDS=0 \
python manage.py check --deploy
```

Result: with `DJANGO_HSTS_SECONDS=0`, only Django's HSTS-not-yet-enabled warning appeared. That warning is expected during staged HSTS rollout and should not be silenced until HTTPS is verified.

Frontend checks:

```bash
cd frontend
npm ci
npm run test --if-present
npm run build
npm audit
```

Result: dependencies installed, 11 frontend tests passed, production build succeeded, and `npm audit` found 0 vulnerabilities.

Bundle scans:

```bash
rg "localhost|127\.0\.0\.1" frontend/dist
rg "SECRET|TOKEN|PASSWORD|PRIVATE|DJANGO_SECRET|BEGIN RSA|BEGIN PRIVATE" frontend/dist
rg "atilahatefi\.ir|canonical|og:url" frontend/dist/index.html
```

Result: no localhost or `127.0.0.1` references were found in the production bundle, no obvious secret markers were found, and the canonical/Open Graph domain metadata was present.

Security scans:

```bash
gitleaks git . --redact --report-format json --report-path .security-reports/gitleaks-history.json
gitleaks dir . --redact --report-format json --report-path .security-reports/gitleaks-working-tree.json
semgrep scan --config p/default --metrics=off --json --output .security-reports/semgrep.json .
snyk test --all-projects --json-file-output=.security-reports/snyk-open-source.json
snyk test --file=requirements.txt --package-manager=pip --command=backend/.venv/bin/python --json-file-output=.security-reports/snyk-python.json
snyk code test --json-file-output=.security-reports/snyk-code.json
bearer scan . --format json --output .security-reports/bearer.json
```

Result:

- Gitleaks: no leaks found in Git history or the working tree.
- Semgrep: 0 findings after documenting two false positives with narrow `nosemgrep` comments.
- Snyk npm dependencies: no vulnerable paths found.
- Snyk all-projects: no vulnerable paths found when using the backend virtualenv Python.
- Snyk Python dependencies: no vulnerable paths found.
- Snyk Code: 0 issues.
- Bearer: no findings; the JSON report was empty.

## Remaining Hosting Actions

- Point DNS records for apex and `www` at the production host.
- Install or issue TLS certificates for both names.
- Configure the redirect rules listed above.
- Configure reverse proxy routes for `/`, `/api/`, `/go-to-settings/`, static files, and `/media/`.
- Set production environment variables on the host.
- Run `python manage.py migrate` and `python manage.py collectstatic --noinput`.
- Create a production superuser if needed.
- Verify upload persistence and backups.
- Start with `DJANGO_HSTS_SECONDS=0`, then increase after HTTPS and redirects are confirmed.
