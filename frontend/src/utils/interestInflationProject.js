import { formatNumber } from "./inflationProject.js";


const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "";
const CALCULATE_ENDPOINT = `${API_BASE_URL}/api/mini-projects/interest-inflation/calculate/`;
const HISTORICAL_ENDPOINT = `${API_BASE_URL}/api/mini-projects/interest-inflation/historical-inflation/`;
const SUPPORTED_COMPOUNDING = [1, 2, 4, 12, 365];
const DEFAULT_INTEREST_VALUES = Object.freeze({
  principal: "1000",
  annualInterestRate: "8",
  years: "10",
  compoundsPerYear: "1",
  annualInflationRate: "5",
});
const COMPOUNDING_OPTIONS = Object.freeze([
  { value: "1", label: "Annually" },
  { value: "2", label: "Semi-annually" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
  { value: "365", label: "Daily" },
]);

class InterestInflationApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message);
    this.name = "InterestInflationApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const initialInterestState = Object.freeze({
  status: "idle",
  result: null,
  error: "",
  fieldErrors: {},
});

function interestCalculatorReducer(state, action) {
  switch (action.type) {
    case "reset":
      return initialInterestState;
    case "loading":
      return { ...initialInterestState, status: "loading" };
    case "success":
      return { ...initialInterestState, status: "success", result: action.result };
    case "validation-error":
      return {
        ...initialInterestState,
        status: "validation-error",
        error: "Check the highlighted fields.",
        fieldErrors: action.fieldErrors,
      };
    case "error":
      return {
        ...initialInterestState,
        status: "error",
        error: action.error,
        fieldErrors: action.fieldErrors || {},
      };
    default:
      return state;
  }
}

function validateInterestInput(values) {
  const errors = {};
  const principal = numericValue(values.principal);
  const interest = numericValue(values.annualInterestRate);
  const years = numericValue(values.years);
  const compounds = numericValue(values.compoundsPerYear);
  const inflation = numericValue(values.annualInflationRate);

  if (!Number.isFinite(principal) || principal <= 0 || principal > 1_000_000_000) {
    errors.principal = "Enter an amount greater than 0 and no more than 1,000,000,000.";
  }
  if (!Number.isFinite(interest) || interest < 0 || interest > 100) {
    errors.annualInterestRate = "Enter an annual rate from 0% to 100%.";
  }
  if (!Number.isInteger(years) || years < 1 || years > 100) {
    errors.years = "Enter a whole number of years from 1 to 100.";
  }
  if (!Number.isInteger(compounds) || !SUPPORTED_COMPOUNDING.includes(compounds)) {
    errors.compoundsPerYear = "Choose a supported compounding frequency.";
  }
  if (!Number.isFinite(inflation) || inflation < -20 || inflation > 100) {
    errors.annualInflationRate = "Enter an annual rate from -20% to 100%.";
  }
  return errors;
}

function numericValue(value) {
  if (typeof value === "boolean" || String(value ?? "").trim() === "") {
    return Number.NaN;
  }
  return Number(value);
}

function calculationPayload(values) {
  return {
    principal: String(values.principal).trim(),
    annual_interest_rate: String(values.annualInterestRate).trim(),
    years: Number(values.years),
    compounds_per_year: Number(values.compoundsPerYear),
    annual_inflation_rate: String(values.annualInflationRate).trim(),
  };
}

async function submitInterestCalculation(values, { fetchImpl = fetch, signal } = {}) {
  const response = await fetchImpl(CALCULATE_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(calculationPayload(values)),
    signal,
  });
  return parseResponse(response, "The calculation could not be completed. Please try again.");
}

async function loadHistoricalInflation(
  { country, startYear, endYear },
  { fetchImpl = fetch, signal } = {},
) {
  const params = new URLSearchParams({
    country: String(country).trim().toUpperCase(),
    start_year: String(startYear),
    end_year: String(endYear),
  });
  const response = await fetchImpl(`${HISTORICAL_ENDPOINT}?${params}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  return parseResponse(
    response,
    "Historical inflation could not be loaded. Manual inflation input remains available.",
  );
}

async function parseResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (response.ok) {
    return data;
  }
  throw new InterestInflationApiError(
    typeof data.detail === "string" ? data.detail : fallbackMessage,
    {
      status: response.status,
      fieldErrors: extractFieldErrors(data),
    },
  );
}

function extractFieldErrors(data) {
  const keyMap = {
    principal: "principal",
    annual_interest_rate: "annualInterestRate",
    years: "years",
    compounds_per_year: "compoundsPerYear",
    annual_inflation_rate: "annualInflationRate",
  };
  return Object.entries(keyMap).reduce((errors, [backendKey, frontendKey]) => {
    const value = data?.[backendKey];
    const message = Array.isArray(value) ? value.find((item) => typeof item === "string") : value;
    if (typeof message === "string") {
      errors[frontendKey] = message;
    }
    return errors;
  }, {});
}

function buildGrowthDatasets(series = []) {
  const definitions = [
    ["cash-nominal", "Cash, nominal", "cash_nominal"],
    ["simple-nominal", "Simple interest, nominal", "simple_nominal"],
    ["compound-nominal", "Compound interest, nominal", "compound_nominal"],
    ["cash-real", "Cash, real", "cash_real"],
    ["simple-real", "Simple interest, real", "simple_real"],
    ["compound-real", "Compound interest, real", "compound_real"],
  ];
  return definitions.map(([key, label, field]) => ({
    key,
    label,
    series: series.map((item) => ({ year: item.year, value: item[field] })),
  }));
}

function buildGrowthChartSummary(result) {
  if (!result?.series?.length) {
    return "No year-by-year values are available.";
  }
  const final = result.summary;
  const years = result.inputs.years;
  return `Across ${years} years, compound interest reaches ${formatNumber(final.compound_nominal)}, or ${formatNumber(final.compound_real)} in inflation-adjusted terms. Simple interest reaches ${formatNumber(final.simple_nominal)} nominally, while unchanged cash has real purchasing power of ${formatNumber(final.cash_real)}.`;
}

function buildGrowthResultSentences(result) {
  if (!result) {
    return [];
  }
  const summary = result.summary;
  const realChange = Number(summary.compound_real) - Number(result.inputs.principal);
  return [
    `Under these fixed assumptions, simple interest produces ${formatNumber(summary.simple_nominal)} and compound interest produces ${formatNumber(summary.compound_nominal)} after ${result.inputs.years} years.`,
    `Compounding adds ${formatNumber(summary.compound_minus_simple)} beyond the simple-interest result.`,
    `After inflation, the compound path is worth ${formatNumber(summary.compound_real)} in year-0 purchasing power.`,
    `The price level changes by ${formatNumber(summary.cumulative_inflation_percent)}%, and the exact annual real return is ${formatNumber(summary.exact_real_annual_return, { maximumFractionDigits: 4 })}%.`,
    realChange >= 0
      ? "Under these assumptions, the compound path increases real purchasing power."
      : "Under these assumptions, the compound path decreases real purchasing power.",
  ];
}

export {
  CALCULATE_ENDPOINT,
  COMPOUNDING_OPTIONS,
  DEFAULT_INTEREST_VALUES,
  HISTORICAL_ENDPOINT,
  InterestInflationApiError,
  buildGrowthChartSummary,
  buildGrowthDatasets,
  buildGrowthResultSentences,
  calculationPayload,
  initialInterestState,
  interestCalculatorReducer,
  loadHistoricalInflation,
  submitInterestCalculation,
  validateInterestInput,
};
