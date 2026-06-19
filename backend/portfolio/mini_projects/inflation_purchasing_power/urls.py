from django.urls import path

from .views import InflationCalculationView, InflationCountriesView


urlpatterns = [
    path("countries/", InflationCountriesView.as_view(), name="inflation-countries"),
    path("calculate/", InflationCalculationView.as_view(), name="inflation-calculate"),
]
