from decimal import Decimal, ROUND_HALF_UP, localcontext

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .calculations import calculate_growth
from .historical_inflation import (
    WORLD_BANK_INDICATOR,
    WORLD_BANK_SOURCE_NAME,
    WORLD_BANK_SOURCE_URL,
    HistoricalInflationClient,
    HistoricalInflationError,
    calculate_historical_inflation,
)
from .serializers import (
    COUNTRIES,
    HistoricalInflationQuerySerializer,
    InterestInflationCalculationSerializer,
)


MONEY_PLACES = Decimal("0.01")
PERCENT_PLACES = Decimal("0.0001")


def decimal_string(value, places):
    decimal_value = Decimal(value)
    required_precision = max(50, len(decimal_value.as_tuple().digits) + abs(decimal_value.adjusted()) + 4)
    with localcontext() as context:
        context.prec = required_precision
        rounded = decimal_value.quantize(places, rounding=ROUND_HALF_UP)
    return format(rounded, "f")


class InterestInflationCalculationView(APIView):
    authentication_classes = ()
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "mini_projects"

    def post(self, request):
        serializer = InterestInflationCalculationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data
        result = calculate_growth(**values)

        return Response(
            {
                "inputs": {
                    "principal": decimal_string(result["inputs"]["principal"], MONEY_PLACES),
                    "annual_interest_rate": decimal_string(
                        result["inputs"]["annual_interest_rate"], PERCENT_PLACES
                    ),
                    "years": result["inputs"]["years"],
                    "compounds_per_year": result["inputs"]["compounds_per_year"],
                    "annual_inflation_rate": decimal_string(
                        result["inputs"]["annual_inflation_rate"], PERCENT_PLACES
                    ),
                },
                "summary": {
                    key: decimal_string(
                        value,
                        PERCENT_PLACES
                        if key
                        in {
                            "cumulative_inflation_percent",
                            "effective_annual_interest_rate",
                            "exact_real_annual_return",
                        }
                        else MONEY_PLACES,
                    )
                    for key, value in result["summary"].items()
                },
                "series": [
                    {
                        "year": item["year"],
                        **{
                            key: decimal_string(value, MONEY_PLACES)
                            for key, value in item.items()
                            if key != "year"
                        },
                    }
                    for item in result["series"]
                ],
                "formulas": result["formulas"],
                "warnings": result["warnings"],
            }
        )


class HistoricalInflationView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "mini_projects"

    def get(self, request):
        serializer = HistoricalInflationQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data

        try:
            series = HistoricalInflationClient().get_annual_rates(
                values["country"],
                values["start_year"],
                values["end_year"],
            )
            result = calculate_historical_inflation(
                series,
                values["start_year"],
                values["end_year"],
            )
        except HistoricalInflationError:
            return Response(
                {
                    "detail": (
                        "Historical inflation data is temporarily unavailable. "
                        "Manual inflation input remains available."
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "country": {
                    "code": values["country"],
                    "name": COUNTRIES[values["country"]],
                },
                "requested_period": {
                    "start_year": values["start_year"],
                    "end_year": values["end_year"],
                },
                "observations_used": result["observations_used"],
                "missing_years": result["missing_years"],
                "annualised_inflation_rate": decimal_string(
                    result["annualised_inflation_rate"], PERCENT_PLACES
                ),
                "cumulative_price_change_percent": decimal_string(
                    result["cumulative_price_change_percent"], PERCENT_PLACES
                ),
                "series": [
                    {
                        "year": item["year"],
                        "value": decimal_string(item["value"], PERCENT_PLACES),
                    }
                    for item in series
                ],
                "label": (
                    "Historical annualised inflation rate based on available "
                    "World Bank annual observations."
                ),
                "source": {
                    "name": WORLD_BANK_SOURCE_NAME,
                    "indicator": WORLD_BANK_INDICATOR,
                    "description": "Inflation, consumer prices (annual %)",
                    "url": WORLD_BANK_SOURCE_URL,
                },
            }
        )
