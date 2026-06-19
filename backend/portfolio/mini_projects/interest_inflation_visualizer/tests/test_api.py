from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase

from portfolio.models import BlogPost, Certificate, ContactTicket

from ..historical_inflation import HistoricalInflationClient, HistoricalInflationServiceError


VALID_REQUEST = {
    "principal": "1000.00",
    "annual_interest_rate": "8.0",
    "years": 10,
    "compounds_per_year": 1,
    "annual_inflation_rate": "5.0",
}
HISTORICAL_SERIES = [
    {"year": 2020, "value": Decimal("10")},
    {"year": 2022, "value": Decimal("21")},
]


class InterestInflationApiTests(TestCase):
    calculate_url = "/api/mini-projects/interest-inflation/calculate/"
    historical_url = "/api/mini-projects/interest-inflation/historical-inflation/"

    def test_calculation_response_schema_and_no_database_writes(self):
        counts_before = (
            Certificate.objects.count(),
            BlogPost.objects.count(),
            ContactTicket.objects.count(),
        )
        response = self.client.post(self.calculate_url, VALID_REQUEST, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(
            set(data),
            {"inputs", "summary", "series", "formulas", "warnings"},
        )
        self.assertEqual(len(data["series"]), 11)
        self.assertEqual(data["series"][0]["year"], 0)
        self.assertEqual(data["summary"]["simple_nominal"], "1800.00")
        self.assertEqual(
            counts_before,
            (
                Certificate.objects.count(),
                BlogPost.objects.count(),
                ContactTicket.objects.count(),
            ),
        )

    def test_invalid_numeric_inputs_and_limits_are_rejected(self):
        cases = {
            "principal": (None, "0", "-1", "1000000001", "NaN", "Infinity", True),
            "annual_interest_rate": (None, "-1", "101", "NaN", "Infinity", True),
            "years": (None, 0, 101, 2.5, True),
            "compounds_per_year": (None, 0, 3, 13, True),
            "annual_inflation_rate": (None, "-21", "101", "NaN", "Infinity", True),
        }
        for field, values in cases.items():
            for value in values:
                payload = {**VALID_REQUEST, field: value}
                with self.subTest(field=field, value=value):
                    response = self.client.post(
                        self.calculate_url,
                        payload,
                        content_type="application/json",
                    )
                    self.assertEqual(response.status_code, 400)
                    self.assertIn(field, response.json())

    def test_maximum_supported_values_format_without_overflow(self):
        response = self.client.post(
            self.calculate_url,
            {
                "principal": "1000000000",
                "annual_interest_rate": "100",
                "years": 100,
                "compounds_per_year": 365,
                "annual_inflation_rate": "100",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["summary"]["compound_nominal"].endswith(".00"))

    @patch.object(HistoricalInflationClient, "get_annual_rates", return_value=HISTORICAL_SERIES)
    def test_historical_response_schema_and_missing_years(self, get_rates):
        response = self.client.get(
            self.historical_url,
            {"country": "TUR", "start_year": 2020, "end_year": 2022},
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["country"], {"code": "TUR", "name": "Türkiye"})
        self.assertEqual(data["observations_used"], 2)
        self.assertEqual(data["missing_years"], [2021])
        self.assertEqual(data["source"]["indicator"], "FP.CPI.TOTL.ZG")

    def test_historical_country_and_years_are_validated(self):
        response = self.client.get(
            self.historical_url,
            {"country": "USA", "start_year": 2022, "end_year": 2020},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("country", response.json())

    @patch.object(
        HistoricalInflationClient,
        "get_annual_rates",
        side_effect=HistoricalInflationServiceError("private upstream details"),
    )
    def test_historical_failure_is_controlled(self, get_rates):
        response = self.client.get(
            self.historical_url,
            {"country": "IRN", "start_year": 2020, "end_year": 2022},
        )
        self.assertEqual(response.status_code, 502)
        self.assertIn("Manual inflation input remains available", response.json()["detail"])
        self.assertNotIn("private upstream details", response.json()["detail"])
