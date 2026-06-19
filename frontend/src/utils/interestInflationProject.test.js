import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import {
  INTEREST_CODE_URL,
  INTEREST_PROJECT_PATH,
  WORLD_BANK_INFLATION_URL,
  miniProjects,
} from "../components/miniProjects/projectCatalog.js";
import {
  DEFAULT_INTEREST_VALUES,
  InterestInflationApiError,
  buildGrowthChartSummary,
  buildGrowthDatasets,
  buildGrowthResultSentences,
  initialInterestState,
  interestCalculatorReducer,
  loadHistoricalInflation,
  submitInterestCalculation,
  validateInterestInput,
} from "./interestInflationProject.js";
import { safeExternalUrl } from "./safeUrl.js";
import { HOME_SECTIONS, resolveRoute } from "./routes.js";


const validValues = { ...DEFAULT_INTEREST_VALUES };
const calculationResult = {
  inputs: {
    principal: "1000.00",
    annual_interest_rate: "8.0000",
    years: 10,
    compounds_per_year: 1,
    annual_inflation_rate: "5.0000",
  },
  summary: {
    cash_nominal: "1000.00",
    cash_real: "613.91",
    simple_nominal: "1800.00",
    simple_real: "1105.04",
    compound_nominal: "2158.92",
    compound_real: "1325.69",
    compound_minus_simple: "358.92",
    cumulative_inflation_percent: "62.8895",
    effective_annual_interest_rate: "8.0000",
    exact_real_annual_return: "2.8571",
  },
  series: [
    { year: 0, cash_nominal: "1000", cash_real: "1000", simple_nominal: "1000", simple_real: "1000", compound_nominal: "1000", compound_real: "1000" },
    { year: 10, cash_nominal: "1000", cash_real: "613.91", simple_nominal: "1800", simple_real: "1105.04", compound_nominal: "2158.92", compound_real: "1325.69" },
  ],
  formulas: ["A_simple = P x (1 + r x t)"],
  warnings: [],
};

describe("Interest mini-project discovery", () => {
  it("shows the second completed project card and route", () => {
    assert.equal(miniProjects.length, 2);
    assert.equal(miniProjects[1].path, INTEREST_PROJECT_PATH);
    assert.equal(resolveRoute(INTEREST_PROJECT_PATH).name, "interestInflationProject");
    assert.deepEqual(HOME_SECTIONS, ["about", "certificates", "contact"]);
  });

  it("keeps the GitHub and World Bank links HTTPS-safe", () => {
    const options = { allowHttp: false, baseUrl: "https://atilahatefi.ir" };
    assert.equal(safeExternalUrl(INTEREST_CODE_URL, options), INTEREST_CODE_URL);
    assert.equal(safeExternalUrl(WORLD_BANK_INFLATION_URL, options), WORLD_BANK_INFLATION_URL);
  });
});

describe("Manual interest calculator", () => {
  it("provides the required default educational example", () => {
    assert.deepEqual(DEFAULT_INTEREST_VALUES, {
      principal: "1000",
      annualInterestRate: "8",
      years: "10",
      compoundsPerYear: "1",
      annualInflationRate: "5",
    });
  });

  it("submits a valid manual calculation as JSON", async () => {
    let request;
    const fetchImpl = async (url, options) => {
      request = { url, options };
      return { ok: true, status: 200, json: async () => calculationResult };
    };
    const response = await submitInterestCalculation(validValues, { fetchImpl });
    const body = JSON.parse(request.options.body);

    assert.equal(response.summary.compound_nominal, "2158.92");
    assert.equal(request.options.method, "POST");
    assert.equal(body.principal, "1000");
    assert.equal(body.compounds_per_year, 1);
  });

  it("returns field-specific validation errors", () => {
    const errors = validateInterestInput({
      principal: "NaN",
      annualInterestRate: "-1",
      years: "0",
      compoundsPerYear: "3",
      annualInflationRate: "Infinity",
    });
    assert.deepEqual(Object.keys(errors).sort(), [
      "annualInflationRate",
      "annualInterestRate",
      "compoundsPerYear",
      "principal",
      "years",
    ]);
  });

  it("represents validation, loading, error, and success states", () => {
    const invalid = interestCalculatorReducer(initialInterestState, { type: "validation-error", fieldErrors: { years: "Invalid" } });
    const loading = interestCalculatorReducer(invalid, { type: "loading" });
    const failed = interestCalculatorReducer(loading, { type: "error", error: "Unavailable" });
    const success = interestCalculatorReducer(failed, { type: "success", result: calculationResult });
    assert.equal(invalid.status, "validation-error");
    assert.equal(loading.status, "loading");
    assert.equal(failed.status, "error");
    assert.equal(success.result.summary.compound_real, "1325.69");
  });

  it("returns a controlled API error", async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 400,
      json: async () => ({ annual_interest_rate: ["Enter a valid rate."] }),
    });
    await assert.rejects(
      submitInterestCalculation(validValues, { fetchImpl }),
      (error) => error instanceof InterestInflationApiError
        && error.fieldErrors.annualInterestRate === "Enter a valid rate.",
    );
  });

  it("builds nominal and real chart series plus neutral result copy", () => {
    const datasets = buildGrowthDatasets(calculationResult.series);
    const summary = buildGrowthChartSummary(calculationResult);
    const sentences = buildGrowthResultSentences(calculationResult);
    assert.equal(datasets.length, 6);
    assert.equal(datasets[0].label, "Cash, nominal");
    assert.equal(datasets[5].label, "Compound interest, real");
    assert.match(summary, /inflation-adjusted terms/);
    assert.match(sentences[0], /Under these fixed assumptions/);
  });
});

describe("Historical preset", () => {
  it("loads the annualised preset without replacing manual calculation logic", async () => {
    const preset = {
      annualised_inflation_rate: "12.3456",
      observations_used: 9,
      missing_years: [2015],
    };
    const fetchImpl = async () => ({ ok: true, status: 200, json: async () => preset });
    const response = await loadHistoricalInflation(
      { country: "TUR", startYear: "2010", endYear: "2020" },
      { fetchImpl },
    );
    assert.equal(response.annualised_inflation_rate, "12.3456");
    assert.deepEqual(DEFAULT_INTEREST_VALUES, validValues);
  });

  it("keeps preset failures controlled so manual mode remains available", async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 502,
      json: async () => ({ detail: "Manual inflation input remains available." }),
    });
    await assert.rejects(
      loadHistoricalInflation(
        { country: "IRN", startYear: "2010", endYear: "2020" },
        { fetchImpl },
      ),
      (error) => error instanceof InterestInflationApiError
        && /Manual inflation input remains available/.test(error.message),
    );
  });
});

describe("Detailed page accessibility and content", () => {
  it("contains cards, chart, table, formulas, sources, limitations, and reset controls", async () => {
    const source = await readFile(
      new URL("../components/miniProjects/InterestInflationPage.jsx", import.meta.url),
      "utf8",
    );
    assert.match(source, /Nominal value/);
    assert.match(source, /Inflation-adjusted real value/);
    assert.match(source, /<ProjectChart/);
    assert.match(source, /<table className="project-table">/);
    assert.match(source, /tabIndex="0"/);
    assert.match(source, /A_compound = P x/);
    assert.match(source, /No external data source is required/);
    assert.match(source, /Historical inflation does not predict future inflation/);
    assert.match(source, /Reset to example/);
    assert.match(source, /Use a historical inflation preset/);
  });

  it("uses native labelled controls and loading guards for keyboard and rapid-submit safety", async () => {
    const source = await readFile(
      new URL("../components/miniProjects/InterestInflationPage.jsx", import.meta.url),
      "utf8",
    );
    assert.match(source, /label htmlFor="interest-principal"/);
    assert.match(source, /aria-live="polite"/);
    assert.match(source, /state\.status === "loading"/);
    assert.match(source, /disabled=\{disabled\}/);
  });

  it("keeps controls responsive and the code link safely external", async () => {
    const css = await readFile(new URL("../styles/global.css", import.meta.url), "utf8");
    const codeLink = await readFile(
      new URL("../components/miniProjects/ProjectCodeLink.jsx", import.meta.url),
      "utf8",
    );
    assert.match(css, /@media \(max-width: 680px\)/);
    assert.match(css, /\.interest-fields/);
    assert.match(codeLink, /target="_blank"/);
    assert.match(codeLink, /rel="noopener noreferrer"/);
  });
});
