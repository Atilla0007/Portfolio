# Mini Project 2 Report

## Project Purpose

**Interest, Growth, and Inflation** is an educational calculator that asks how
unchanged cash, simple interest, compound growth, and inflation affect future
nominal value and real purchasing power. It uses fixed assumptions and explicitly
does not provide financial advice or investment predictions.

## Formulas

```text
Simple interest = P x (1 + r x t)
Compound interest = P x (1 + r / n)^(n x t)
Inflation factor = (1 + i)^t
Real value = Nominal value / Inflation factor
EAR = (1 + r / n)^n - 1
Exact real rate = ((1 + EAR) / (1 + i)) - 1
```

The historical preset compounds each available annual inflation observation and
then geometrically annualises the resulting cumulative price factor. Core
calculations use `Decimal`, retain elevated precision through intermediate steps,
and round only for API display.

## Backend Architecture

Pure financial functions are independent of Django. DRF serializers validate the
POST body and historical query before views call the calculation or fixed-host
World Bank client. Neither API writes calculations or user input to the database.

```text
backend/portfolio/mini_projects/interest_inflation_visualizer/
  calculations.py
  historical_inflation.py
  serializers.py
  views.py
  urls.py
  tests/
```

## API Endpoints

```text
POST /api/mini-projects/interest-inflation/calculate/
GET  /api/mini-projects/interest-inflation/historical-inflation/
```

The calculation response contains normalized inputs, final nominal and real
metrics, year-by-year values from year 0, formulas, and educational warnings.

## Validation Rules

- Principal: greater than 0 and no more than 1,000,000,000.
- Years: integer from 1 through 100.
- Interest: 0% through 100%; negative interest is deliberately unsupported.
- Inflation: -20% through 100%, allowing controlled deflation.
- Compounding: annually, semi-annually, quarterly, monthly, or daily.
- Missing values, booleans, malformed decimals, NaN, and Infinity are rejected.

## World Bank Preset

The optional preset supports only Türkiye (`TUR`) and Iran (`IRN`) through the
fixed World Bank API hostname and indicator `FP.CPI.TOTL.ZG`. It uses a 10-second
timeout, response-size limit, safe JSON parsing, pagination, a fixed country
allowlist, and a 12-hour cache for successful responses. Missing years are listed,
never interpolated or treated as zero. Preset failure leaves manual mode usable.

## Frontend

```text
frontend/src/components/miniProjects/InterestInflationPage.jsx
frontend/src/utils/interestInflationProject.js
frontend/src/utils/interestInflationProject.test.js
```

The page reuses `MiniProjectLayout`, `ProjectExplanation`, `ProjectMetric`,
`ProjectChart`, `ProjectSourceList`, and `ProjectCodeLink`. The shared chart now
supports labelled multi-series data while preserving Project 1's single-series
interface. Results are also available in a keyboard-scrollable table.

## Verification Results

- Django system check: passed.
- Django tests: 72 passed in the final full-suite run, including 26 new-project tests.
- Migration check: no model changes detected.
- Python dependency check: no broken requirements.
- Frontend tests: 36 passed in the final clean-install run.
- Vite production build: passed.
- Browser QA: desktop and 390 x 844 mobile layouts passed. Both cards rendered, the default manual calculation produced metrics, six labelled chart series, and the accessible table, and the live World Bank preset applied successfully.
- Gitleaks: no leaks found.
- Bearer: 175 checks ran with no failures.
- Snyk Code: 0 issues.
- Snyk dependency scan: the npm project had no vulnerable paths; Python dependency resolution was unavailable to Snyk.
- `npm audit`: blocked because the restricted environment could not resolve the npm registry.
- Semgrep: the registry rule pack could not be retrieved in the restricted certificate/network environment; Snyk Code and Bearer completed independently with no findings.

## Limitations

Interest and manual inflation are held constant. Taxes, fees, risk, deposits, and
withdrawals are excluded. Historical inflation does not predict future inflation,
national averages may differ from personal experience, and daily compounding is
simplified to 365 periods. Results are educational, not financial advice.

## Code

https://github.com/Atilla0007/Portfolio/tree/main/backend/portfolio/mini_projects/interest_inflation_visualizer

## cPanel Update

After the merge, pull `main`, activate the Node environment, run `npm ci`, tests,
and `npm run build`; then activate the Python environment, install requirements,
run Django checks/tests/migrations/collectstatic, and restart Passenger with
`touch backend/tmp/restart.txt`. No DNS, database-model, or cPanel application
configuration change is required for this project.
