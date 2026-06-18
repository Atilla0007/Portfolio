from mimetypes import guess_type

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse
from django.views.decorators.http import require_GET


def _safe_file(root, *parts):
    root = root.resolve()
    candidate = root.joinpath(*parts).resolve()

    try:
        candidate.relative_to(root)
    except ValueError as exc:
        raise Http404 from exc

    if not candidate.is_file():
        raise Http404

    return candidate


def _safe_frontend_file(*parts):
    return _safe_file(settings.FRONTEND_DIST_DIR, *parts)


def _safe_media_file(*parts):
    return _safe_file(settings.MEDIA_ROOT, *parts)


def _frontend_file_response(file_path, cache_control):
    content_type = guess_type(file_path.name)[0] or "application/octet-stream"
    response = FileResponse(file_path.open("rb"), content_type=content_type)
    response["Cache-Control"] = cache_control
    return response


@require_GET
def frontend_asset(request, path):
    file_path = _safe_frontend_file("assets", path)
    return _frontend_file_response(
        file_path,
        f"public, max-age={settings.FRONTEND_ASSET_MAX_AGE}, immutable",
    )


@require_GET
def media_file(request, path):
    file_path = _safe_media_file(path)
    return _frontend_file_response(file_path, "public, max-age=3600")


@require_GET
def frontend_index(request, path=""):
    try:
        file_path = _safe_frontend_file("index.html")
    except Http404:
        return HttpResponse(
            "Frontend build is missing. Run npm run build in frontend.",
            status=503,
            content_type="text/plain",
        )

    return _frontend_file_response(file_path, "no-cache")


def backend_not_found(request, *args, **kwargs):
    raise Http404
