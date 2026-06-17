from django.urls import path

from .views import CertificateListView, ContactTicketCreateView

urlpatterns = [
    path("certificates/", CertificateListView.as_view(), name="certificate-list"),
    path("tickets/", ContactTicketCreateView.as_view(), name="ticket-create"),
]
