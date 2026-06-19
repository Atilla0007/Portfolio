# Mini Project 1 Report

## Project

**What Is Your Money Really Worth?** is an interactive inflation and
purchasing-power calculator using Python, Django REST Framework, React, and annual
World Bank consumer price index data.

## Files Changed

- Added reusable backend mini-project packages under `backend/portfolio/mini_projects/`.
- Added the inflation calculation, World Bank client, serializers, views, URLs, tests, and project README.
- Added reusable frontend mini-project layout, explanation, metric, chart, source, and code-link components.
- Added `/mini-projects` and `/mini-projects/inflation-purchasing-power` routes.
- Added visible header, footer, and About links without changing the homepage's three main sections.
- Added frontend calculator utilities, tests, responsive styling, page metadata, API throttling, and documentation.

## Architecture

The browser calls same-origin Django endpoints only. Django validates the country,
years, and amount, then constructs a request against the fixed World Bank API base.
The upstream response is size-limited, parsed, cached on success, and transformed
into controlled JSON. Calculations remain pure Python and do not write to the
database.

The frontend uses a catalog-driven project index and reusable presentational
components. The chart is accessible SVG built without an additional chart library.

## Formulas

```text
Price factor = CPI_end / CPI_start
Cumulative inflation (%) = ((CPI_end / CPI_start) - 1) * 100
Equivalent end-year amount = Amount * (CPI_end / CPI_start)
Same nominal amount's start-year purchasing power = Amount * (CPI_start / CPI_end)
```

Calculations use `Decimal`, require positive finite CPI and amount values, and
handle inflation, deflation, and unchanged price levels.

## API Endpoints

```text
GET /api/mini-projects/inflation/countries/
GET /api/mini-projects/inflation/calculate/
```

Calculation query parameters are `country`, `start_year`, `end_year`, and `amount`.
Public requests use DRF scoped throttling. Successful World Bank responses are
cached for 12 hours by default.

## Tests

Backend coverage includes formulas, deflation, equal CPI values, zero CPI, amount,
year and country validation, malformed responses, missing years, timeout handling,
cache reuse, successful API output, controlled errors, and no database writes.

Frontend coverage includes navigation visibility, homepage section preservation,
project routing and catalog content, valid submission, field validation, loading,
error and success states, result text, safe links, chart summaries, and accessibility
attributes.

## Build And Security Results

- Django system check: passed.
- Django tests: 46 passed in the final run.
- Migration check: no model changes detected.
- Python dependency check: no broken requirements.
- Frontend tests: 23 passed in the final run.
- Vite production build: passed.
- Browser QA: desktop and 390 x 844 mobile layouts passed; the live local calculator loaded World Bank metadata and rendered metrics plus the accessible CPI chart.
- Production bundle localhost/API-subdomain check: no matches.
- Gitleaks: no leaks found.
- Semgrep: the completed scan reported 0 findings after replacing dynamic URL construction with a fixed-host HTTPS client. A final repeat was blocked while retrieving registry rules by the restricted certificate environment; the only later code change disables form controls during loading.
- Snyk Code: 0 issues after removing dynamic API-managed blog anchors.
- Bearer: 0 findings. The environment-driven cookie settings retain secure production defaults and have narrow analyzer annotations for local HTTP development.
- Snyk dependency scan: npm project tested with no vulnerable paths; Python project resolution was blocked by the sandbox because the Snyk CLI attempted to bind a localhost proxy.
- `npm audit`: blocked because the npm registry could not be resolved from the restricted environment.

## Source Attribution

World Bank — World Development Indicators  
Indicator: `FP.CPI.TOTL`  
Consumer price index (2010 = 100)  
https://data.worldbank.org/indicator/FP.CPI.TOTL

## Remaining Limitations

- National CPI is an average and personal spending patterns differ.
- Individual goods may move differently from the overall index.
- Annual observations may later be revised.
- CPI does not measure every dimension of living standards.
- The calculator is descriptive, not predictive, and cannot identify causes.
- World Bank availability and revisions remain external dependencies.
