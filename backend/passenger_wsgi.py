import os
import sys
import traceback
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


def load_env_file(path):
    if not path.is_file():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def write_startup_error():
    log_path = BASE_DIR / "passenger_startup_error.log"
    safe_env_keys = [
        "DATABASE_URL",
        "DJANGO_ALLOWED_HOSTS",
        "DJANGO_CSRF_TRUSTED_ORIGINS",
        "DJANGO_DEBUG",
        "DJANGO_SECRET_KEY",
        "FRONTEND_DIST_DIR",
    ]
    env_summary = "\n".join(
        f"{key}=<set>" if os.environ.get(key) else f"{key}=<missing>"
        for key in safe_env_keys
    )
    try:
        log_path.write_text(
            "\n".join(
                [
                    "Passenger startup failed.",
                    f"Python: {sys.version}",
                    f"Executable: {sys.executable}",
                    f"CWD: {Path.cwd()}",
                    f"BASE_DIR: {BASE_DIR}",
                    env_summary,
                    "",
                    traceback.format_exc(),
                ]
            ),
            encoding="utf-8",
        )
    except Exception:
        pass


load_env_file(BASE_DIR / ".env")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portfolio_backend.settings")

try:
    from portfolio_backend.wsgi import application  # noqa: E402
except Exception:
    write_startup_error()
    raise
