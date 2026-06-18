from django.urls import path

from .views import (
    BlogPostDetailView,
    BlogPostListView,
    CertificateListView,
    ContactTicketCreateView,
)

urlpatterns = [
    path("certificates/", CertificateListView.as_view(), name="certificate-list"),
    path("tickets/", ContactTicketCreateView.as_view(), name="ticket-create"),
    path("blog/", BlogPostListView.as_view(), name="blog-list"),
    path("blog/<slug:slug>/", BlogPostDetailView.as_view(), name="blog-detail"),
]
