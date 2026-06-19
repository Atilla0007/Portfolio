from datetime import date
from decimal import Decimal

from rest_framework import serializers

from .calculations import SUPPORTED_COMPOUNDING


COUNTRIES = {"TUR": "Türkiye", "IRN": "Iran"}
MIN_YEAR = 1960


class RejectBooleanNumbersMixin:
    numeric_fields = ()

    def to_internal_value(self, data):
        errors = {
            field: ["Enter a valid number."]
            for field in self.numeric_fields
            if isinstance(data, dict) and isinstance(data.get(field), bool)
        }
        if errors:
            raise serializers.ValidationError(errors)
        return super().to_internal_value(data)


class InterestInflationCalculationSerializer(
    RejectBooleanNumbersMixin,
    serializers.Serializer,
):
    numeric_fields = (
        "principal",
        "annual_interest_rate",
        "years",
        "compounds_per_year",
        "annual_inflation_rate",
    )
    principal = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01"),
        max_value=Decimal("1000000000"),
    )
    annual_interest_rate = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        min_value=Decimal("0"),
        max_value=Decimal("100"),
    )
    years = serializers.IntegerField(min_value=1, max_value=100)
    compounds_per_year = serializers.IntegerField()
    annual_inflation_rate = serializers.DecimalField(
        max_digits=9,
        decimal_places=6,
        min_value=Decimal("-20"),
        max_value=Decimal("100"),
    )

    def validate_compounds_per_year(self, value):
        if value not in SUPPORTED_COMPOUNDING:
            raise serializers.ValidationError(
                "Choose annually, semi-annually, quarterly, monthly, or daily."
            )
        return value


class HistoricalInflationQuerySerializer(
    RejectBooleanNumbersMixin,
    serializers.Serializer,
):
    numeric_fields = ("start_year", "end_year")
    country = serializers.ChoiceField(choices=tuple(COUNTRIES))
    start_year = serializers.IntegerField(
        min_value=MIN_YEAR,
        max_value=date.today().year,
    )
    end_year = serializers.IntegerField(
        min_value=MIN_YEAR,
        max_value=date.today().year,
    )

    def validate(self, attrs):
        if attrs["start_year"] > attrs["end_year"]:
            raise serializers.ValidationError(
                {"end_year": "End year must not be earlier than start year."}
            )
        return attrs
