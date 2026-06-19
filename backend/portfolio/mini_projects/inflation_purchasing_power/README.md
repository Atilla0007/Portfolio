# Inflation And Purchasing Power Calculator

## Economic Question

How does inflation change the amount of money required to purchase an equivalent
general basket of goods and services across two years?

This project compares a country's annual consumer price index (CPI) in two exact
years. It does not replace missing years or claim that a national average matches
every household's experience.

## Formulas

```text
Price factor = CPI_end / CPI_start

Cumulative inflation (%) = ((CPI_end / CPI_start) - 1) * 100

Equivalent end-year amount = Amount * (CPI_end / CPI_start)

Start-year purchasing power of the same nominal amount in the end year =
Amount * (CPI_start / CPI_end)
```

Pure `Decimal` calculations live in `calculations.py`. Positive finite amounts
and CPI values are required. A lower end-year CPI correctly produces deflation.

## Data Source

The backend uses the World Bank Indicators API v2 with the fixed base URL
`https://api.worldbank.org/v2` and indicator `FP.CPI.TOTL` (Consumer price index,
2010 = 100). No API key is required.

Regional aggregates are removed from the country list. Successful country and
CPI responses are cached for 12 hours by default. Network failures and malformed
responses are not stored as successful cache entries.

## API Architecture

```text
GET /api/mini-projects/inflation/countries/
GET /api/mini-projects/inflation/calculate/
```

The browser calls Django only. Django constructs requests against the fixed World
Bank host, applies a timeout and response-size limit, parses JSON, validates exact
years, and returns a controlled response. User-provided URLs and indicators are
never accepted.

## Validation And Security

- Three-letter country codes must exist in fetched country metadata.
- Years are restricted to 1960 through the current year.
- The end year must be later than the start year.
- Amounts must be finite, positive, and no greater than `999999999999.99`.
- Selected years must exist in the returned CPI series.
- Public endpoints use DRF scoped throttling.
- Calculations are not saved to the database.
- Raw upstream exceptions are not returned to clients.

## Tests

Tests cover formulas, deflation, equal CPI values, invalid inputs, country and year
validation, malformed data, missing years, timeouts, cache reuse, successful API
responses, and the absence of database writes. World Bank requests are mocked;
the test suite does not require internet access.

## Known Limitations

National CPI is an average. Personal spending patterns and individual prices vary.
The project uses annual observations, World Bank data may be revised, and CPI does
not measure every aspect of living standards. The calculator is descriptive, not
predictive, and cannot establish why inflation occurred.

## Frontend Paths

The reusable project UI is under:

```text
frontend/src/components/miniProjects/
frontend/src/utils/inflationProject.js
```
