import socket
from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.test import SimpleTestCase

from ..historical_inflation import (
    HistoricalInflationClient,
    HistoricalInflationResponseError,
    HistoricalInflationServiceError,
    calculate_historical_inflation,
)


SERIES = [
    {"year": 2020, "value": Decimal("10")},
    {"year": 2022, "value": Decimal("21")},
]
PAYLOAD = [
    {"page": 1, "pages": 1},
    [
        {"date": "2022", "value": 21},
        {"date": "2021", "value": None},
        {"date": "2020", "value": 10},
    ],
]


class HistoricalInflationTests(SimpleTestCase):
    def setUp(self):
        cache.clear()
        self.client = HistoricalInflationClient(timeout=1, cache_seconds=60)

    def tearDown(self):
        cache.clear()

    def test_historical_rates_are_compounded(self):
        result = calculate_historical_inflation(SERIES, 2020, 2022)
        self.assertEqual(result["cumulative_price_change_percent"], Decimal("33.100"))

    def test_historical_rate_is_geometrically_annualised(self):
        result = calculate_historical_inflation(SERIES, 2020, 2022)
        expected = (Decimal("1.331") ** (Decimal("1") / Decimal("2")) - 1) * 100
        self.assertEqual(result["annualised_inflation_rate"], expected)

    def test_missing_historical_years_are_listed_not_zero_filled(self):
        result = calculate_historical_inflation(SERIES, 2020, 2022)
        self.assertEqual(result["observations_used"], 2)
        self.assertEqual(result["missing_years"], [2021])

    @patch.object(HistoricalInflationClient, "_request_json", return_value=PAYLOAD)
    def test_world_bank_series_is_parsed_sorted_and_cached(self, request_json):
        expected = [
            {"year": 2020, "value": Decimal("10")},
            {"year": 2022, "value": Decimal("21")},
        ]
        self.assertEqual(self.client.get_annual_rates("TUR", 2020, 2022), expected)
        self.assertEqual(self.client.get_annual_rates("TUR", 2020, 2022), expected)
        request_json.assert_called_once()

    def test_pagination_is_followed(self):
        first = [{"page": 1, "pages": 2}, [{"date": "2020", "value": 10}]]
        second = [{"page": 2, "pages": 2}, [{"date": "2021", "value": 12}]]
        with patch.object(self.client, "_request_json", side_effect=[first, second]) as request_json:
            result = self.client.get_annual_rates("IRN", 2020, 2021)
        self.assertEqual(len(result), 2)
        self.assertEqual(request_json.call_count, 2)

    def test_malformed_world_bank_data_is_rejected(self):
        malformed_payloads = (
            {"bad": "shape"},
            [{"page": 1, "pages": 1}, [{"date": "2020", "value": "NaN"}]],
            [{"page": 1, "pages": 1}, [{"date": "2020", "value": -100}]],
        )
        for payload in malformed_payloads:
            with self.subTest(payload=payload):
                cache.clear()
                with patch.object(self.client, "_request_json", return_value=payload):
                    with self.assertRaises(HistoricalInflationResponseError):
                        self.client.get_annual_rates("TUR", 2020, 2020)

    @patch(
        "portfolio.mini_projects.interest_inflation_visualizer.historical_inflation.HTTPSConnection",
        side_effect=socket.timeout,
    )
    def test_world_bank_timeout_is_controlled(self, connection):
        with self.assertRaises(HistoricalInflationServiceError):
            self.client._request_json("/country/TUR/indicator/test", {"format": "json"})
