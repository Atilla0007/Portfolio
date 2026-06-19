# Interest, Growth, and Inflation Visualizer

This educational mini project asks: **How do simple interest, compound growth,
and inflation affect the future nominal and real value of money?**

## Formulas

```text
Simple interest = P x (1 + r x t)
Compound interest = P x (1 + r / n)^(n x t)
Inflation factor = (1 + i)^t
Real value = Nominal value / Inflation factor
EAR = (1 + r / n)^n - 1
Exact real rate = ((1 + EAR) / (1 + i)) - 1
```

`P` is principal, `r` is the annual nominal rate as a decimal, `t` is years,
`n` is periods per year, and `i` is annual inflation as a decimal. Calculations
use `Decimal` with elevated precision. Exponents are integer except for the
historical geometric annualisation; Python's `Decimal` fractional power is used
there, so no binary floating-point arithmetic is required. Values are rounded
only when preparing the API response.

## Validation

- Principal: greater than 0 and no more than 1,000,000,000.
- Years: integer from 1 through 100.
- Interest: 0% through 100%; negative interest is deliberately rejected.
- Inflation: -20% through 100%, allowing controlled deflation examples.
- Compounding: 1, 2, 4, 12, or 365 periods per year.
- Missing values, booleans, malformed decimals, NaN, and Infinity are rejected.

Annual compounding updates once per year; periodic compounding uses the selected
number of periods. Nominal values show the amount before price adjustment. Real
values divide each nominal path by the cumulative inflation factor.

## APIs

```text
POST /api/mini-projects/interest-inflation/calculate/
GET  /api/mini-projects/interest-inflation/historical-inflation/
```

The calculator needs no external data. The optional historical preset supports
only Türkiye (`TUR`) and Iran (`IRN`) and uses World Bank indicator
`FP.CPI.TOTL.ZG`. Django calls the fixed World Bank host with a timeout, response
size limit, safe parsing, pagination, missing-year reporting, and a 12-hour cache
for successful responses. Historical annualisation uses the geometric rate over
available observations; missing years are never treated as zero or interpolated.

Neither endpoint writes calculations or user inputs to the database. Tests cover
the formulas, all frequencies, validation, precision, API schemas, no database
writes, historical compounding, annualisation, missing data, pagination, cache
reuse, malformed responses, and timeouts.

Frontend paths:

```text
frontend/src/components/miniProjects/InterestInflationPage.jsx
frontend/src/utils/interestInflationProject.js
```

Limitations include constant-rate assumptions and exclusion of taxes, fees, risk,
deposits, and withdrawals. Historical inflation does not predict future inflation,
national averages differ from personal experience, and all output is educational,
not financial advice.
