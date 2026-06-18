from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

from .frontend import backend_not_found, frontend_asset, frontend_index, media_file
from .health import health_check

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("go-to-settings/", admin.site.urls),
    path("api/", include("portfolio.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += [
    re_path(r"^admin(?:/.*)?$", backend_not_found, name="old-admin-not-found"),
    re_path(r"^(?:api|go-to-settings|health)(?:/.*)?$", backend_not_found, name="backend-not-found"),
    re_path(r"^media/(?P<path>.+)$", media_file, name="media-file"),
    re_path(r"^assets/(?P<path>.+)$", frontend_asset, name="frontend-asset"),
    re_path(r"^(?P<path>.*)$", frontend_index, name="frontend-index"),
]
