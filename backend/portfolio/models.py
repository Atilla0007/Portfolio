from django.db import models
from django.utils import timezone

from .validators import (
    validate_certificate_file_upload,
    validate_certificate_image_upload,
    validate_http_url,
)


class Certificate(models.Model):
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField(null=True, blank=True)
    image = models.ImageField(
        upload_to="certificates/",
        blank=True,
        null=True,
        validators=[validate_certificate_image_upload],
    )
    file = models.FileField(
        upload_to="certificates/",
        blank=True,
        null=True,
        validators=[validate_certificate_file_upload],
    )
    external_url = models.URLField(blank=True, validators=[validate_http_url])
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_visible = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order", "-date", "title")

    def __str__(self):
        return self.title


class ContactTicket(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        READ = "read", "Read"
        REPLIED = "replied", "Replied"
        CLOSED = "closed", "Closed"

    name = models.CharField(max_length=120)
    email = models.EmailField(max_length=254)
    subject = models.CharField(max_length=160)
    message = models.TextField(max_length=2000)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )
    ip_hash = models.CharField(max_length=64, blank=True, editable=False)
    user_agent = models.CharField(max_length=255, blank=True, editable=False)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.subject} - {self.email}"
