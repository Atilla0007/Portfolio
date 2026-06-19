from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase

from portfolio.models import BlogPost, Certificate, ContactTicket

from ..world_bank import WorldBankClient, WorldBankResponseError


COUNTRIES = [
    {"code": "IRN", "name": "Iran, Islamic Rep."},
    {"code": "TUR", "name": "Türkiye"},
]

SERIES = [
    {"year": 2010, "value": Decimal("100")},
    {"year": 2011, "value": Decimal("106.47")},
    {"year": 2012, "value": Decimal("115")},
]


class InflationApiTests(TestCase):
    calculate_url = "/api/mini-projects/inflation/calculate/"
    countries_url = "/api/mini-projects/inflation/countries/"

    @patch.object(WorldBankClient, "get_latest_available_year", return_value=2024)
    @patch.object(WorldBankClient, "get_countries", return_value=COUNTRIES)
    def test_country_endpoint_returns_defaults(self, get_countries, latest_year):
        response = self.client.get(self.countries_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["defaults"]["country"], "TUR")
        self.assertEqual(response.json()["defaults"]["end_year"], 2024)
        self.assertEqual(len(response.json()["countries"]), 2)

    @patch.object(WorldBankClient, "get_cpi_series", return_value=SERIES)
    @patch.object(WorldBankClient, "get_countries", return_value=COUNTRIES)
    def test_successful_calculation_returns_structured_result(self, get_countries, get_series):
        counts_before = (
            Certificate.objects.count(),
            BlogPost.objects.count(),
            ContactTicket.objects.count(),
        )

        response = self.client.get(
            self.calculate_url,
            {
                "country": "TUR",
                "start_year": 2010,
                "end_year": 2012,
                "amount": "100.00",
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["country"], {"code": "TUR", "name": "Türkiye"})
        self.assertEqual(data["cumulative_inflation_percent"], 15)
        self.assertEqual(data["equivalent_end_year_amount"], 115)
        self.assertEqual(data["same_nominal_amount_start_year_value"], 86.96)
        self.assertEqual(data["source"]["indicator"], "FP.CPI.TOTL")
        self.assertEqual(
            counts_before,
            (
                Certificate.objects.count(),
                BlogPost.objects.count(),
                ContactTicket.objects.count(),
            ),
        )

    @patch.object(WorldBankClient, "get_countries", return_value=COUNTRIES)
    def test_country_must_be_in_fetched_country_list(self, get_countries):
        response = self.client.get(
            self.calculate_url,
            {
                "country": "USA",
                "start_year": 2010,
                "end_year": 2012,
                "amount": "100",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("country", response.json())

    @patch.object(WorldBankClient, "get_countries", return_value=COUNTRIES)
    def test_year_order_is_validated(self, get_countries):
        response = self.client.get(
            self.calculate_url,
            {
                "country": "TUR",
                "start_year": 2020,
                "end_year": 2020,
                "amount": "100",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("end_year", response.json())

    @patch.object(WorldBankClient, "get_countries", return_value=COUNTRIES)
    def test_amount_is_validated(self, get_countries):
        for amount in ("NaN", "Infinity", "-1", "0", "1000000000000"):
            with self.subTest(amount=amount):
                response = self.client.get(
                    self.calculate_url,
                    {
                        "country": "TUR",
                        "start_year": 2010,
                        "end_year": 2012,
                        "amount": amount,
                    },
                )
                self.assertEqual(response.status_code, 400)
                self.assertIn("amount", response.json())

    @patch.object(
        WorldBankClient,
        "get_cpi_series",
        return_value=[{"year": 2010, "value": Decimal("100")}],
    )
    @patch.object(WorldBankClient, "get_countries", return_value=COUNTRIES)
    def test_missing_year_returns_available_years(self, get_countries, get_series):
        response = self.client.get(
            self.calculate_url,
            {
                "country": "TUR",
                "start_year": 2010,
                "end_year": 2012,
                "amount": "100",
            },
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["missing_years"], [2012])
        self.assertEqual(response.json()["available_years"], [2010])

    @patch.object(
        WorldBankClient,
        "get_countries",
        side_effect=WorldBankResponseError("upstream details"),
    )
    def test_api_error_does_not_expose_raw_exception(self, get_countries):
        response = self.client.get(self.countries_url)

        self.assertEqual(response.status_code, 502)
        self.assertNotIn("upstream details", response.json()["detail"])
