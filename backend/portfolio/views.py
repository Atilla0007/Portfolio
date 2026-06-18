import hashlib

from django.conf import settings
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle

from .models import BlogPost, Certificate
from .serializers import (
    BlogPostDetailSerializer,
    BlogPostListSerializer,
    CertificateSerializer,
    ContactTicketSerializer,
)


class CertificateListView(ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return Certificate.objects.filter(is_visible=True).order_by(
            "order",
            "-date",
            "title",
        )


class ContactTicketCreateView(CreateAPIView):
    serializer_class = ContactTicketSerializer
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "tickets"

    def perform_create(self, serializer):
        serializer.save(
            ip_hash=self._ip_hash(),
            user_agent=self.request.META.get("HTTP_USER_AGENT", "")[:255],
        )

    def _ip_hash(self):
        ip = self.request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
        ip = ip or self.request.META.get("REMOTE_ADDR", "")
        if not ip:
            return ""
        return hashlib.sha256(f"{settings.SECRET_KEY}:{ip}".encode()).hexdigest()


class BlogPostListView(ListAPIView):
    serializer_class = BlogPostListSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True).prefetch_related("sources")


class BlogPostDetailView(RetrieveAPIView):
    serializer_class = BlogPostDetailSerializer
    permission_classes = (AllowAny,)
    lookup_field = "slug"

    def get_queryset(self):
        return BlogPost.objects.filter(is_published=True).prefetch_related("sources")
