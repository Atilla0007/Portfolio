from decimal import Decimal

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .calculations import calculate_purchasing_power
from .serializers import InflationCalculationQuerySerializer, MIN_YEAR
from .world_bank import (
    WORLD_BANK_INDICATOR,
    WORLD_BANK_SOURCE_NAME,
    WORLD_BANK_SOURCE_URL,
    MissingCPIDataError,
    WorldBankClient,
    WorldBankError,
)


def decimal_number(value):
    decimal_value = Decimal(value)
    if decimal_value == decimal_value.to_integral_value():
        return int(decimal_value)
    return float(decimal_value)


class InflationCountriesView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "mini_projects"

    def get(self, request):
        client = WorldBankClient()
        try:
            countries = client.get_countries()
            latest_turkiye_year = client.get_latest_available_year("TUR", 2010)
        except WorldBankError:
            return Response(
                {"detail": "Country data is temporarily unavailable. Please try again later."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "countries": countries,
                "year_range": {
                    "minimum": MIN_YEAR,
                    "maximum": latest_turkiye_year,
                },
                "defaults": {
                    "country": "TUR",
                    "start_year": 2010,
                    "end_year": latest_turkiye_year,
                    "amount": 100,
                },
            }
        )


class InflationCalculationView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "mini_projects"

    def get(self, request):
        client = WorldBankClient()
        try:
            countries = client.get_countries()
        except WorldBankError:
            return self._service_error()

        country_names = {country["code"]: country["name"] for country in countries}
        serializer = InflationCalculationQuerySerializer(
            data=request.query_params,
            context={"allowed_country_codes": set(country_names)},
        )
        serializer.is_valid(raise_exception=True)
        query = serializer.validated_data

        try:
            series = client.get_cpi_series(
                query["country"],
                query["start_year"],
                query["end_year"],
            )
            start_cpi, end_cpi = client.require_selected_years(
                series,
                query["start_year"],
                query["end_year"],
            )
        except MissingCPIDataError as exc:
            return Response(
                {
                    "detail": str(exc),
                    "missing_years": exc.missing_years,
                    "available_years": exc.available_years,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        except WorldBankError:
            return self._service_error()

        result = calculate_purchasing_power(query["amount"], start_cpi, end_cpi)
        return Response(
            {
                "country": {
                    "code": query["country"],
                    "name": country_names[query["country"]],
                },
                "start_year": query["start_year"],
                "end_year": query["end_year"],
                "amount": decimal_number(result["amount"]),
                "start_cpi": decimal_number(result["start_cpi"]),
                "end_cpi": decimal_number(result["end_cpi"]),
                "cumulative_inflation_percent": decimal_number(
                    result["cumulative_inflation_percent"]
                ),
                "equivalent_end_year_amount": decimal_number(
                    result["equivalent_end_year_amount"]
                ),
                "same_nominal_amount_start_year_value": decimal_number(
                    result["same_nominal_amount_start_year_value"]
                ),
                "series": [
                    {
                        "year": item["year"],
                        "value": decimal_number(item["value"]),
                    }
                    for item in series
                ],
                "source": {
                    "name": WORLD_BANK_SOURCE_NAME,
                    "indicator": WORLD_BANK_INDICATOR,
                    "description": "Consumer price index (2010 = 100)",
                    "url": WORLD_BANK_SOURCE_URL,
                },
            }
        )

    @staticmethod
    def _service_error():
        return Response(
            {"detail": "World Bank data is temporarily unavailable. Please try again later."},
            status=status.HTTP_502_BAD_GATEWAY,
        )
