from django.contrib import admin

from .models import BlogPost, BlogSource, Certificate, ContactTicket


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "issuer",
        "year",
        "order",
        "featured",
        "is_visible",
        "updated_at",
    )
    list_editable = ("order", "featured", "is_visible")
    list_filter = ("category", "featured", "is_visible", "issuer", "year")
    search_fields = ("title", "issuer", "description", "learning_outcome")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("order", "-year", "title")

    fieldsets = (
        (None, {"fields": ("title", "issuer", "description", "category", "date", "year")}),
        (
            "Achievement details",
            {
                "fields": (
                    "duration_hours",
                    "score_display",
                    "result_display",
                    "learning_outcome",
                    "academic_connection",
                )
            },
        ),
        ("Media", {"fields": ("image", "file", "external_url")}),
        ("Publishing", {"fields": ("order", "featured", "is_visible")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


class BlogSourceInline(admin.TabularInline):
    model = BlogSource
    extra = 0
    fields = ("label", "url", "order")


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "published_at",
        "order",
        "featured",
        "is_published",
        "updated_at",
    )
    list_editable = ("order", "featured", "is_published")
    list_filter = ("category", "featured", "is_published", "published_at")
    search_fields = ("title", "slug", "excerpt", "body")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("updated_at",)
    inlines = (BlogSourceInline,)
    ordering = ("order", "-published_at", "title")

    fieldsets = (
        (None, {"fields": ("title", "slug", "category", "excerpt")}),
        ("Article", {"fields": ("body", "key_takeaways")}),
        ("Publication", {"fields": ("published_at", "estimated_reading_time")}),
        ("SEO", {"fields": ("seo_title", "meta_description")}),
        ("Publishing controls", {"fields": ("order", "featured", "is_published")}),
        ("Timestamps", {"fields": ("updated_at",)}),
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
