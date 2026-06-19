import json
import socket
from datetime import date
from decimal import Decimal, InvalidOperation, localcontext
from http.client import HTTPException, HTTPSConnection
from urllib.parse import urlencode

from django.conf import settings
from django.core.cache import cache

from .serializers import COUNTRIES


WORLD_BANK_HOST = "api.worldbank.org"
WORLD_BANK_BASE_PATH = "/v2"
WORLD_BANK_INDICATOR = "FP.CPI.TOTL.ZG"
WORLD_BANK_SOURCE_NAME = "World Bank — World Development Indicators"
WORLD_BANK_SOURCE_URL = "https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG"
MAX_RESPONSE_BYTES = 2 * 1024 * 1024
DEFAULT_TIMEOUT_SECONDS = 10
DEFAULT_CACHE_SECONDS = 12 * 60 * 60
MAX_PAGES = 10
USER_AGENT = "AtilaHatefiPortfolio/1.0 (interest-inflation-project)"


class HistoricalInflationError(RuntimeError):
    pass


class HistoricalInflationResponseError(HistoricalInflationError):
    pass


class HistoricalInflationServiceError(HistoricalInflationError):
    pass


class HistoricalInflationClient:
    def __init__(self, timeout=None, cache_seconds=None):
        self.timeout = timeout or getattr(
            settings,
            "WORLD_BANK_TIMEOUT_SECONDS",
            DEFAULT_TIMEOUT_SECONDS,
        )
        self.cache_seconds = cache_seconds or getattr(
            settings,
            "WORLD_BANK_CACHE_SECONDS",
            DEFAULT_CACHE_SECONDS,
        )

    def get_annual_rates(self, country_code, start_year, end_year):
        country = str(country_code).strip().upper()
        if country not in COUNTRIES:
            raise ValueError("Historical country is not supported.")
        if not 1960 <= start_year <= end_year <= date.today().year:
            raise ValueError("Historical period is outside the supported range.")

        cache_key = (
            f"mini-projects:world-bank:annual-inflation:v1:"
            f"{country}:{start_year}:{end_year}"
        )
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        series = []
        page = 1
        pages = 1
        while page <= pages:
            payload = self._request_json(
                f"/country/{country}/indicator/{WORLD_BANK_INDICATOR}",
                {
                    "date": f"{start_year}:{end_year}",
                    "format": "json",
                    "per_page": 100,
                    "page": page,
                },
            )
            metadata, records = self._response_parts(payload)
            pages = self._page_count(metadata)
            if pages > MAX_PAGES:
                raise HistoricalInflationResponseError(
                    "World Bank response contained too many pages."
                )
            series.extend(
                self._parse_records(records, start_year=start_year, end_year=end_year)
            )
            page += 1

        unique_years = {item["year"] for item in series}
        if len(unique_years) != len(series):
            raise HistoricalInflationResponseError(
                "World Bank returned duplicate annual observations."
            )
        if not series:
            raise HistoricalInflationResponseError(
                "No historical inflation observations are available for this period."
            )

        series.sort(key=lambda item: item["year"])
        cache.set(cache_key, series, self.cache_seconds)
        return series

    def _request_json(self, path, params):
        if not path.startswith("/") or "//" in path:
            raise ValueError("World Bank path must use the fixed API base.")
        request_path = f"{WORLD_BANK_BASE_PATH}{path}?{urlencode(params)}"
        connection = None
        try:
            # Python verifies TLS certificates; the destination host is fixed above.
            connection = HTTPSConnection(  # nosemgrep: python.lang.security.audit.httpsconnection-detected.httpsconnection-detected
                WORLD_BANK_HOST,
                timeout=self.timeout,
            )
            connection.request(
                "GET",
                request_path,
                headers={"Accept": "application/json", "User-Agent": USER_AGENT},
            )
            response = connection.getresponse()
            if response.status != 200:
                raise HistoricalInflationServiceError(
                    "World Bank request was unsuccessful."
                )
            raw = response.read(MAX_RESPONSE_BYTES + 1)
        except (HTTPException, OSError, TimeoutError, socket.timeout) as exc:
            raise HistoricalInflationServiceError(
                "World Bank data is temporarily unavailable."
            ) from exc
        finally:
            if connection is not None:
                connection.close()

        if len(raw) > MAX_RESPONSE_BYTES:
            raise HistoricalInflationResponseError(
                "World Bank response exceeded the size limit."
            )
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise HistoricalInflationResponseError(
                "World Bank returned malformed JSON."
            ) from exc

    @staticmethod
    def _response_parts(payload):
        if (
            not isinstance(payload, list)
            or len(payload) != 2
            or not isinstance(payload[0], dict)
            or not isinstance(payload[1], list)
        ):
            raise HistoricalInflationResponseError(
                "World Bank returned an unexpected response."
            )
        return payload[0], payload[1]

    @staticmethod
    def _page_count(metadata):
        try:
            page = int(metadata.get("page", 1))
            pages = int(metadata.get("pages", 1))
        except (TypeError, ValueError) as exc:
            raise HistoricalInflationResponseError(
                "World Bank returned invalid pagination metadata."
            ) from exc
        if page < 1 or pages < 1 or page > pages:
            raise HistoricalInflationResponseError(
                "World Bank returned invalid pagination metadata."
            )
        return pages

    @staticmethod
    def _parse_records(records, start_year, end_year):
        parsed = []
        for record in records:
            if not isinstance(record, dict):
                raise HistoricalInflationResponseError(
                    "World Bank returned malformed inflation data."
                )
            if record.get("value") is None:
                continue
            try:
                year = int(record.get("date"))
                value = Decimal(str(record.get("value")))
            except (InvalidOperation, TypeError, ValueError) as exc:
                raise HistoricalInflationResponseError(
                    "World Bank returned malformed inflation values."
                ) from exc
            if (
                not value.is_finite()
                or value <= Decimal("-100")
                or year < start_year
                or year > end_year
            ):
                raise HistoricalInflationResponseError(
                    "World Bank returned invalid inflation values."
                )
            parsed.append({"year": year, "value": value})
        return parsed


def calculate_historical_inflation(series, start_year, end_year):
    if not series:
        raise HistoricalInflationResponseError(
            "No historical inflation observations are available for this period."
        )

    with localcontext() as context:
        context.prec = 50
        cumulative_factor = Decimal("1")
        for item in series:
            cumulative_factor *= Decimal("1") + item["value"] / Decimal("100")
        observations = len(series)
        annualised_factor = cumulative_factor ** (
            Decimal("1") / Decimal(observations)
        )

    observed_years = {item["year"] for item in series}
    return {
        "observations_used": observations,
        "missing_years": [
            year for year in range(start_year, end_year + 1) if year not in observed_years
        ],
        "annualised_inflation_rate": (
            annualised_factor - Decimal("1")
        ) * Decimal("100"),
        "cumulative_price_change_percent": (
            cumulative_factor - Decimal("1")
        ) * Decimal("100"),
    }
