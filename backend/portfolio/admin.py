from django.contrib import admin

from .models import Certificate, ContactTicket


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("title", "issuer", "date", "order", "is_visible", "updated_at")
    list_editable = ("order", "is_visible")
    list_filter = ("is_visible", "issuer", "date")
    search_fields = ("title", "issuer", "description")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("order", "-date", "title")

    fieldsets = (
        (None, {"fields": ("title", "issuer", "description", "date")}),
        ("Media", {"fields": ("image", "file", "external_url")}),
        ("Publishing", {"fields": ("order", "is_visible")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(ContactTicket)
class ContactTicketAdmin(admin.ModelAdmin):
    list_display = ("subject", "name", "email", "status", "created_at")
    list_editable = ("status",)
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "subject", "message")
    readonly_fields = ("name", "email", "subject", "message", "ip_hash", "user_agent", "created_at", "updated_at")
    ordering = ("-created_at",)

    fieldsets = (
        ("Ticket", {"fields": ("name", "email", "subject", "message", "status")}),
        ("Request metadata", {"fields": ("ip_hash", "user_agent")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
