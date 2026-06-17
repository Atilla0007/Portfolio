from django.conf import settings
from django.db import connections
from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health_check(request):
    if settings.HEALTH_CHECK_DATABASE:
        try:
            connections["default"].ensure_connection()
        except Exception:
            return JsonResponse({"status": "unhealthy"}, status=503)

    return JsonResponse({"status": "ok"})
