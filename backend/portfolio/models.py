from django.db import models
from django.utils import timezone

from .validators import (
    validate_certificate_file_upload,
    validate_certificate_image_upload,
    validate_http_url,
)


class Certificate(models.Model):
    class Category(models.TextChoices):
        TECHNICAL = "technical", "Technical Learning"
        MATHEMATICS = "mathematics", "Mathematics"
        SPORTS = "sports", "Sports Achievement"

    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=40,
        choices=Category.choices,
        default=Category.TECHNICAL,
        db_index=True,
    )
    date = models.DateField(null=True, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    duration_hours = models.PositiveIntegerField(null=True, blank=True)
    score_display = models.CharField(max_length=80, blank=True)
    result_display = models.CharField(max_length=180, blank=True)
    learning_outcome = models.TextField(blank=True)
    academic_connection = models.TextField(blank=True)
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
    featured = models.BooleanField(default=False, db_index=True)
    is_visible = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("order", "-date", "title")

    def __str__(self):
        return self.title


class BlogPost(models.Model):
    title = models.CharField(max_length=220)
    slug = models.SlugField(max_length=240, unique=True)
    category = models.CharField(max_length=120)
    excerpt = models.TextField(max_length=520)
    body = models.TextField()
    key_takeaways = models.TextField(blank=True)
    published_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    estimated_reading_time = models.PositiveSmallIntegerField(default=6)
    seo_title = models.CharField(max_length=240)
    meta_description = models.CharField(max_length=320)
    is_published = models.BooleanField(default=False, db_index=True)
    featured = models.BooleanField(default=False, db_index=True)
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ("order", "-published_at", "title")

    def __str__(self):
        return self.title


class BlogSource(models.Model):
    post = models.ForeignKey(
        BlogPost,
        related_name="sources",
        on_delete=models.CASCADE,
    )
    label = models.CharField(max_length=180)
    url = models.URLField(validators=[validate_http_url])
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ("order", "label")

    def __str__(self):
        return self.label


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
