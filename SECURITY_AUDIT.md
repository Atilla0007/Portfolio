# Security Audit

Date: 2026-06-17

## Summary

Performed a focused security-remediation pass for the Django + React portfolio project. Changes were limited to dependency hardening, URL validation, upload validation, production-sensitive settings, tests, and scanner follow-up. Public certificate display was preserved.

## Initial Findings

- Snyk dependency scan reported Pillow 11.3.0 vulnerabilities and recommended Pillow 12.2.0.
- Snyk Code reported two medium DOM-XSS findings in `frontend/src/components/Certificates.jsx` for dynamic `src` and `href` values.
- Semgrep initially reported findings in the custom Django admin templates. Those custom templates have since been removed so Django uses its standard admin templates.
- Bearer reports were reviewed from `.security-reports/`; the secrets JSON report contained no findings.
- Gitleaks working tree report contained no leaks. Git history scan had previously scanned 0 commits, so it was not proof of historical cleanliness.

## Confirmed Fixes

- Upgraded Pillow requirement to `Pillow>=12.2.0,<13.0` and installed Pillow 12.2.0 in `backend/.venv`.
- Added explicit frontend URL allowlisting with the `URL` constructor and protocol checks.
- Certificate image and link rendering now omits unsafe values and uses `rel="noopener noreferrer"` for new-tab links.
- Added backend validation for certificate external URLs, upload sizes, allowed extensions, image content, PDF magic bytes, and path traversal patterns.
- Tightened public certificate serializer fields to intended public data only.
- Added production-sensitive Django settings:
  - `DJANGO_SECRET_KEY` required when `DJANGO_DEBUG=False`.
  - Explicit environment-driven hosts, CSRF trusted origins, and CORS origins.
  - Secure cookie defaults in production.
  - HTTPS redirect default in production.
  - content-type nosniff, referrer policy, and `X_FRAME_OPTIONS="DENY"`.
- Updated `.gitignore` to exclude generated reports, env files, virtualenvs, SQLite DB, media uploads, frontend build output, dependency caches, and `graphify-out/`.
- Added `.env.example` with placeholders only.

## False Positives / Remaining Findings

- `python manage.py check --deploy` has 1 remaining warning:
  - `security.W004`: HSTS is not configured.
  - Classification: remaining manual deployment decision.
  - Reason: HSTS should only be enabled after the production domain is known to be permanently HTTPS-ready.

## Bearer Review

- `bearer-secrets.json`: empty.
- After rerun, `bearer-secrets-after.json`: empty.
- No real credential was identified in the reviewed Bearer reports.
- No credential rotation is required from this pass.

## Backend Controls

- Public visitors can read only visible certificates through `/api/certificates/`.
- Hidden certificates are filtered by the queryset and are covered by tests.
- Anonymous POST, PUT, PATCH, and DELETE requests to the public certificates endpoint are rejected by unsupported methods.
- Certificate descriptions are returned as plain text and React renders them as text nodes.
- No `dangerouslySetInnerHTML` usage was found in frontend source.
- Upload validation prevents unsupported executable/HTML/SVG-style uploads by extension allowlist and content checks.

## Tests Added

### Django

- Public certificate API read behavior.
- Hidden certificate filtering.
- Anonymous write rejection.
- Invalid and dangerous external URL rejection.
- Oversized upload rejection.
- Unsupported upload type rejection.
- Valid image upload acceptance.
- Serializer public field exposure.
- Settings helper parsing.

### Frontend

- Safe HTTPS URL handling.
- Safe HTTP localhost URL handling.
- Relative `/media/...` URL handling.
- Rejection of `javascript:`, `data:`, and `vbscript:` URLs.
- Malformed and empty URL rejection.
- Certificate display guards for unsafe image and link values.
- Valid certificate links continue to work.

## Before / After Scanner Results

- Semgrep:
  - Before: 4 findings.
  - After: 1 finding, documented as a CSRF false positive.
- Gitleaks working tree:
  - After: 0 leaks.
- Bearer secrets:
  - Before: 0 findings.
  - After: 0 findings.
- Snyk dependency:
  - After: 2 projects tested, no vulnerable paths found.
- Snyk Code:
  - Before: 2 medium DOM-XSS findings.
  - After: 0 issues.
- npm audit:
  - After: 0 vulnerabilities.

## Verification Commands

- `cd backend && source .venv/bin/activate && python manage.py check`
- `cd backend && source .venv/bin/activate && python manage.py test`
- `cd backend && source .venv/bin/activate && python -m pip check`
- `cd backend && source .venv/bin/activate && DJANGO_DEBUG=False ... python manage.py check --deploy`
- `cd frontend && npm ci`
- `cd frontend && npm run lint --if-present`
- `cd frontend && npm run test --if-present`
- `cd frontend && npm run build`
- `cd frontend && npm audit`
- `gitleaks dir . --redact --report-format json --report-path .security-reports/gitleaks-working-tree-after.json`
- `semgrep scan --config p/default --metrics=off --json --output .security-reports/semgrep-after.json .`
- `snyk test --all-projects`
- `snyk code test .`
- `bearer scan . --format html --output .security-reports/bearer-security-after.html`
- `bearer scan . --report privacy --format html --output .security-reports/bearer-privacy-after.html`
- `bearer scan . --scanner secrets --format json --output .security-reports/bearer-secrets-after.json`

## Remaining Manual Actions

- Configure real production environment variables:
  - `DJANGO_SECRET_KEY`
  - `DJANGO_DEBUG=False`
  - `DJANGO_ALLOWED_HOSTS`
  - `DJANGO_CSRF_TRUSTED_ORIGINS`
  - `DJANGO_CORS_ALLOWED_ORIGINS`
- Enable HSTS only after the final deployment domain is confirmed HTTPS-only.
- Run a Git history Gitleaks scan only after a safe baseline commit exists. The repository currently has no commits.
- Review staged files before any commit; do not commit `.security-reports/`, virtualenvs, media uploads, SQLite DBs, build output, or dependency caches.

## Files Modified

- `.env.example`
- `.gitignore`
- `SECURITY_AUDIT.md`
- `requirements.txt`
- `backend/portfolio/models.py`
- `backend/portfolio/serializers.py`
- `backend/portfolio/tests.py`
- `backend/portfolio/validators.py`
- `backend/portfolio/migrations/0003_alter_certificate_external_url_and_more.py`
- `backend/portfolio_backend/settings.py`
- `frontend/package.json`
- `frontend/src/components/Certificates.jsx`
- `frontend/src/utils/certificateDisplay.js`
- `frontend/src/utils/safeUrl.js`
- `frontend/src/utils/safeUrl.test.js`
