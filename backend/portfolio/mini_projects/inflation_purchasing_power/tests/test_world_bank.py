import socket
from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.test import SimpleTestCase

from ..world_bank import (
    MissingCPIDataError,
    WorldBankClient,
    WorldBankResponseError,
    WorldBankServiceError,
)


COUNTRY_PAYLOAD = [
    {"page": 1},
    [
        {"id": "TUR", "name": "Turkiye", "region": {"id": "ECS", "value": "Europe"}},
        {"id": "WLD", "name": "World", "region": {"id": "NA", "value": "Aggregates"}},
    ],
]

CPI_PAYLOAD = [
    {"page": 1},
    [
        {"date": "2020", "value": 150.5},
        {"date": "2019", "value": 140.25},
    ],
]


class WorldBankClientTests(SimpleTestCase):
    def setUp(self):
        cache.clear()
        self.client = WorldBankClient(timeout=1, cache_seconds=60)

    def tearDown(self):
        cache.clear()

    @patch.object(WorldBankClient, "_request_json", return_value=COUNTRY_PAYLOAD)
    def test_country_metadata_excludes_aggregates(self, request_json):
        self.assertEqual(
            self.client.get_countries(),
            [{"code": "TUR", "name": "Türkiye"}],
        )
        request_json.assert_called_once()

    @patch.object(WorldBankClient, "_request_json", return_value=COUNTRY_PAYLOAD)
    def test_successful_country_response_is_cached(self, request_json):
        self.client.get_countries()
        self.client.get_countries()

        request_json.assert_called_once()

    @patch.object(WorldBankClient, "_request_json", return_value=CPI_PAYLOAD)
    def test_cpi_series_is_sorted_and_uses_decimal(self, request_json):
        result = self.client.get_cpi_series("TUR", 2019, 2020)

        self.assertEqual(
            result,
            [
                {"year": 2019, "value": Decimal("140.25")},
                {"year": 2020, "value": Decimal("150.5")},
            ],
        )

    def test_malformed_world_bank_response_is_rejected(self):
        with patch.object(self.client, "_request_json", return_value={"bad": "data"}):
            with self.assertRaises(WorldBankResponseError):
                self.client.get_countries()

    def test_missing_selected_year_lists_available_years(self):
        series = [{"year": 2020, "value": Decimal("150") }]

        with self.assertRaises(MissingCPIDataError) as context:
            self.client.require_selected_years(series, 2019, 2020)

        self.assertEqual(context.exception.missing_years, [2019])
        self.assertEqual(context.exception.available_years, [2020])

    @patch(
        "portfolio.mini_projects.inflation_purchasing_power.world_bank.HTTPSConnection",
        side_effect=socket.timeout,
    )
    def test_timeout_returns_controlled_service_error(self, connection):
        with self.assertRaises(WorldBankServiceError):
            self.client._request_json("/country", {"format": "json"})
