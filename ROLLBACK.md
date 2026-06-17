# Rollback

Rollback is a release operation. Do not delete data or reverse migrations blindly.

## Application Rollback

Recommended host layout:

```text
/srv/portfolio/current
/srv/portfolio/releases/previous
/srv/portfolio/shared/media
```

Switch back to the previous release:

```bash
sudo systemctl stop portfolio-gunicorn
ln -sfn /srv/portfolio/releases/previous /srv/portfolio/current
sudo systemctl start portfolio-gunicorn
sudo nginx -t
sudo systemctl reload nginx
```

Keep at least one previous release directory available.

## Database Migration Rollback Limits

Review migrations before rollback:

```bash
cd /srv/portfolio/current/backend
source .venv/bin/activate
python manage.py showmigrations portfolio
python manage.py migrate --plan
deactivate
```

Do not reverse destructive migrations unless a tested database backup exists. If a migration dropped data or transformed data irreversibly, restore from backup instead.

## Database Backup Restoration

Stop application writes first.

For a custom-format backup:

```bash
pg_restore --clean --if-exists --dbname "$DATABASE_URL" /secure-backups/portfolio.dump
```

For a plain SQL backup:

```bash
psql "$DATABASE_URL" < /secure-backups/portfolio.sql
```

Validate after restore:

```bash
cd /srv/portfolio/current/backend
source .venv/bin/activate
python manage.py migrate --plan
python manage.py check
deactivate
```

## Media Restoration

Restore media from the matching backup:

```bash
rsync -a /secure-backups/portfolio-media/ "$DJANGO_MEDIA_ROOT/"
```

Ensure restored files are readable by the web server and are not executable.

## Validation After Rollback

Run:

```bash
curl -I https://atilahatefi.ir/
curl -I https://atilahatefi.ir/health/
curl -I https://atilahatefi.ir/go-to-settings/
curl -I https://atilahatefi.ir/static/
curl -I https://atilahatefi.ir/media/
curl https://atilahatefi.ir/api/certificates/
```

Then verify:

- Frontend loads.
- Certificate cards load.
- Admin login page responds.
- Contact ticket creation still works.
- Uploaded media files load.
- Logs show no repeated 500 errors.
- Database and media backups are still scheduled.

## When To Stop And Review

Stop and review manually if:

- The previous release expects an older database schema.
- A migration removed or rewrote data.
- Media files were deleted or overwritten.
- TLS or canonical redirects changed at the same time as the app release.
- Health checks fail after restoring the previous version.
