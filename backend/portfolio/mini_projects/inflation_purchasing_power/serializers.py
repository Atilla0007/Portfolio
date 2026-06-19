import re
from datetime import date
from decimal import Decimal

from rest_framework import serializers


COUNTRY_CODE_RE = re.compile(r"^[A-Z]{3}$")
MIN_YEAR = 1960
MAX_AMOUNT = Decimal("999999999999.99")


class InflationCalculationQuerySerializer(serializers.Serializer):
    country = serializers.CharField(min_length=3, max_length=3)
    start_year = serializers.IntegerField(min_value=MIN_YEAR, max_value=date.today().year)
    end_year = serializers.IntegerField(min_value=MIN_YEAR, max_value=date.today().year)
    amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal("0.01"),
        max_value=MAX_AMOUNT,
    )

    def validate_country(self, value):
        code = value.strip().upper()
        if not COUNTRY_CODE_RE.fullmatch(code):
            raise serializers.ValidationError("Enter a valid three-letter country code.")

        allowed_codes = self.context.get("allowed_country_codes", set())
        if code not in allowed_codes:
            raise serializers.ValidationError("Select a country from the available list.")
        return code

    def validate(self, attrs):
        if attrs["start_year"] >= attrs["end_year"]:
            raise serializers.ValidationError(
                {"end_year": "End year must be later than start year."}
            )
        return attrs
