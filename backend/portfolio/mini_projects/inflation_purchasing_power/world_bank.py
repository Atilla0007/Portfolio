import json
import re
import socket
from datetime import date
from decimal import Decimal, InvalidOperation
from http.client import HTTPException, HTTPSConnection
from urllib.parse import urlencode

from django.conf import settings
from django.core.cache import cache


WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2"
WORLD_BANK_HOST = "api.worldbank.org"
WORLD_BANK_BASE_PATH = "/v2"
WORLD_BANK_INDICATOR = "FP.CPI.TOTL"
WORLD_BANK_SOURCE_NAME = "World Bank — World Development Indicators"
WORLD_BANK_SOURCE_URL = "https://data.worldbank.org/indicator/FP.CPI.TOTL"
COUNTRY_CODE_RE = re.compile(r"^[A-Z]{3}$")
MAX_RESPONSE_BYTES = 2 * 1024 * 1024
DEFAULT_TIMEOUT_SECONDS = 10
DEFAULT_CACHE_SECONDS = 12 * 60 * 60
USER_AGENT = "AtilaHatefiPortfolio/1.0 (inflation-purchasing-power-project)"


class WorldBankError(RuntimeError):
    pass


class WorldBankResponseError(WorldBankError):
    pass


class WorldBankServiceError(WorldBankError):
    pass


class MissingCPIDataError(WorldBankError):
    def __init__(self, missing_years, available_years):
        self.missing_years = sorted(missing_years)
        self.available_years = sorted(available_years)
        years = ", ".join(str(year) for year in self.missing_years)
        super().__init__(f"CPI data is unavailable for: {years}.")


class WorldBankClient:
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

    def get_countries(self):
        cache_key = "mini-projects:world-bank:countries:v1"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        payload = self._request_json(
            "/country",
            {"format": "json", "per_page": 400},
        )
        records = self._records(payload)
        countries = []

        for record in records:
            if not isinstance(record, dict):
                raise WorldBankResponseError("World Bank returned malformed country data.")

            code = str(record.get("id", "")).upper()
            name = str(record.get("name", "")).strip()
            region = record.get("region") or {}
            region_id = str(region.get("id", ""))
            region_name = str(region.get("value", ""))

            if (
                not COUNTRY_CODE_RE.fullmatch(code)
                or not name
                or region_id == "NA"
                or region_name.lower() == "aggregates"
            ):
                continue

            if code == "TUR":
                name = "Türkiye"
            countries.append({"code": code, "name": name})

        if not countries:
            raise WorldBankResponseError("World Bank returned no country metadata.")

        countries.sort(key=lambda country: country["name"].casefold())
        cache.set(cache_key, countries, self.cache_seconds)
        return countries

    def get_cpi_series(self, country_code, start_year, end_year):
        country = self._validated_country_code(country_code)
        start = self._validated_year(start_year)
        end = self._validated_year(end_year)
        if start > end:
            raise ValueError("Start year must not be later than end year.")

        cache_key = f"mini-projects:world-bank:cpi:v1:{country}:{start}:{end}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        payload = self._request_json(
            f"/country/{country}/indicator/{WORLD_BANK_INDICATOR}",
            {
                "date": f"{start}:{end}",
                "format": "json",
                "per_page": 100,
            },
        )
        records = self._records(payload)
        series = []

        for record in records:
            if not isinstance(record, dict):
                raise WorldBankResponseError("World Bank returned malformed CPI data.")
            if record.get("value") is None:
                continue

            try:
                year = int(record.get("date"))
                value = Decimal(str(record.get("value")))
            except (InvalidOperation, TypeError, ValueError) as exc:
                raise WorldBankResponseError(
                    "World Bank returned malformed CPI values."
                ) from exc

            if not value.is_finite() or value <= 0 or year < start or year > end:
                raise WorldBankResponseError("World Bank returned invalid CPI values.")
            series.append({"year": year, "value": value})

        series.sort(key=lambda item: item["year"])
        cache.set(cache_key, series, self.cache_seconds)
        return series

    def get_latest_available_year(self, country_code, start_year=1960):
        series = self.get_cpi_series(country_code, start_year, date.today().year)
        if not series:
            raise MissingCPIDataError([], [])
        return max(item["year"] for item in series)

    def require_selected_years(self, series, start_year, end_year):
        values = {item["year"]: item["value"] for item in series}
        missing = [year for year in (start_year, end_year) if year not in values]
        if missing:
            raise MissingCPIDataError(missing, values.keys())
        return values[start_year], values[end_year]

    def _request_json(self, path, params):
        if not path.startswith("/") or "//" in path:
            raise ValueError("World Bank path must be relative to the fixed API base.")

        request_path = f"{WORLD_BANK_BASE_PATH}{path}?{urlencode(params)}"
        connection = None

        try:
            # Python 3.11+ verifies TLS certificates; the host is a fixed constant.
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
                raise WorldBankServiceError("World Bank request was unsuccessful.")
            raw = response.read(MAX_RESPONSE_BYTES + 1)
        except (HTTPException, OSError, TimeoutError, socket.timeout) as exc:
            raise WorldBankServiceError("World Bank data is temporarily unavailable.") from exc
        finally:
            if connection is not None:
                connection.close()

        if len(raw) > MAX_RESPONSE_BYTES:
            raise WorldBankResponseError("World Bank response exceeded the size limit.")

        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise WorldBankResponseError("World Bank returned malformed JSON.") from exc

    @staticmethod
    def _records(payload):
        if (
            not isinstance(payload, list)
            or len(payload) != 2
            or not isinstance(payload[0], dict)
            or not isinstance(payload[1], list)
        ):
            raise WorldBankResponseError("World Bank returned an unexpected response.")
        return payload[1]

    @staticmethod
    def _validated_country_code(value):
        code = str(value).strip().upper()
        if not COUNTRY_CODE_RE.fullmatch(code):
            raise ValueError("Country code must contain three letters.")
        return code

    @staticmethod
    def _validated_year(value):
        if isinstance(value, bool):
            raise ValueError("Year must be an integer.")
        try:
            year = int(value)
        except (TypeError, ValueError) as exc:
            raise ValueError("Year must be an integer.") from exc
        if year < 1960 or year > date.today().year:
            raise ValueError("Year is outside the supported range.")
        return year
