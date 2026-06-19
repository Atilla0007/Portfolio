const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "";
const COUNTRIES_ENDPOINT = `${API_BASE_URL}/api/mini-projects/inflation/countries/`;
const CALCULATE_ENDPOINT = `${API_BASE_URL}/api/mini-projects/inflation/calculate/`;
const MAX_AMOUNT = 999999999999.99;

class InflationApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {}, availableYears = [] } = {}) {
    super(message);
    this.name = "InflationApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.availableYears = availableYears;
  }
}

const initialCalculatorState = {
  status: "idle",
  result: null,
  error: "",
  fieldErrors: {},
  availableYears: [],
};

function calculatorReducer(state, action) {
  switch (action.type) {
    case "reset":
      return initialCalculatorState;
    case "loading":
      return { ...initialCalculatorState, status: "loading" };
    case "success":
      return { ...initialCalculatorState, status: "success", result: action.result };
    case "validation-error":
      return {
        ...initialCalculatorState,
        status: "validation-error",
        error: "Check the highlighted fields.",
        fieldErrors: action.fieldErrors,
      };
    case "error":
      return {
        ...initialCalculatorState,
        status: "error",
        error: action.error,
        fieldErrors: action.fieldErrors || {},
        availableYears: action.availableYears || [],
      };
    default:
      return state;
  }
}

function validateCalculatorInput(values, { countryCodes = [], minimumYear = 1960, maximumYear } = {}) {
  const errors = {};
  const country = String(values.country || "").trim().toUpperCase();
  const startYear = Number(values.startYear);
  const endYear = Number(values.endYear);
  const amount = Number(values.amount);
  const maxYear = maximumYear || new Date().getFullYear();

  if (!/^[A-Z]{3}$/.test(country) || !countryCodes.includes(country)) {
    errors.country = "Select a country from the list.";
  }
  if (!Number.isInteger(startYear) || startYear < minimumYear || startYear > maxYear) {
    errors.startYear = `Choose a year from ${minimumYear} to ${maxYear}.`;
  }
  if (!Number.isInteger(endYear) || endYear < minimumYear || endYear > maxYear) {
    errors.endYear = `Choose a year from ${minimumYear} to ${maxYear}.`;
  } else if (Number.isInteger(startYear) && endYear <= startYear) {
    errors.endYear = "End year must be later than start year.";
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
    errors.amount = "Enter a positive amount within the supported range.";
  }

  return errors;
}

function buildCalculationUrl(values) {
  const params = new URLSearchParams({
    country: String(values.country).trim().toUpperCase(),
    start_year: String(values.startYear),
    end_year: String(values.endYear),
    amount: String(values.amount),
  });
  return `${CALCULATE_ENDPOINT}?${params}`;
}

async function loadInflationCountries({ fetchImpl = fetch, signal } = {}) {
  const response = await fetchImpl(COUNTRIES_ENDPOINT, {
    headers: { Accept: "application/json" },
    signal,
  });
  return parseResponse(response, "Country data could not be loaded. Please try again.");
}

async function submitInflationCalculation(values, { fetchImpl = fetch, signal } = {}) {
  const response = await fetchImpl(buildCalculationUrl(values), {
    headers: { Accept: "application/json" },
    signal,
  });
  return parseResponse(response, "The calculation could not be completed. Please try again.");
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (response.ok) {
    return data;
  }

  const fieldErrors = extractFieldErrors(data);
  throw new InflationApiError(
    typeof data.detail === "string" ? data.detail : fallbackMessage,
    {
      status: response.status,
      fieldErrors,
      availableYears: Array.isArray(data.available_years) ? data.available_years : [],
    },
  );
}

function extractFieldErrors(data) {
  if (!data || typeof data !== "object") {
    return {};
  }

  return ["country", "start_year", "end_year", "amount"].reduce((errors, key) => {
    const value = data[key];
    const message = Array.isArray(value) ? value.find((item) => typeof item === "string") : value;
    if (typeof message === "string") {
      const frontendKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      errors[frontendKey] = message;
    }
    return errors;
  }, {});
}

function formatNumber(value, { maximumFractionDigits = 2 } = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "-";
  }
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits,
  }).format(number);
}

function buildResultSentences(result) {
  if (!result) {
    return [];
  }

  const change = Number(result.cumulative_inflation_percent);
  const changeSentence = change < 0
    ? `The general price level decreased by approximately ${formatNumber(Math.abs(change))}%.`
    : change > 0
      ? `The general price level increased by approximately ${formatNumber(change)}%.`
      : "The general price level was unchanged across the selected years.";
  return [
    `The CPI moved from ${formatNumber(result.start_cpi, { maximumFractionDigits: 4 })} in ${result.start_year} to ${formatNumber(result.end_cpi, { maximumFractionDigits: 4 })} in ${result.end_year}.`,
    changeSentence,
    `${formatNumber(result.amount)} in ${result.start_year} corresponds to approximately ${formatNumber(result.equivalent_end_year_amount)} in ${result.end_year}, based on national CPI.`,
  ];
}

function buildChartSummary(series, countryName = "the selected country") {
  if (!Array.isArray(series) || series.length === 0) {
    return "No CPI observations are available for the selected period.";
  }
  const first = series[0];
  const last = series[series.length - 1];
  return `CPI series for ${countryName}: ${formatNumber(first.value, { maximumFractionDigits: 4 })} in ${first.year}, ending at ${formatNumber(last.value, { maximumFractionDigits: 4 })} in ${last.year}, across ${series.length} annual observations.`;
}

export {
  CALCULATE_ENDPOINT,
  COUNTRIES_ENDPOINT,
  InflationApiError,
  buildCalculationUrl,
  buildChartSummary,
  buildResultSentences,
  calculatorReducer,
  formatNumber,
  initialCalculatorState,
  loadInflationCountries,
  submitInflationCalculation,
  validateCalculatorInput,
};
