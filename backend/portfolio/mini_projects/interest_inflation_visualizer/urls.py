from django.urls import path

from .views import HistoricalInflationView, InterestInflationCalculationView


urlpatterns = [
    path(
        "calculate/",
        InterestInflationCalculationView.as_view(),
        name="interest-inflation-calculate",
    ),
    path(
        "historical-inflation/",
        HistoricalInflationView.as_view(),
        name="interest-historical-inflation",
    ),
]
