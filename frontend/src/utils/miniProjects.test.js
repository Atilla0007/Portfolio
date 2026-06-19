import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import { headerLinks, footerLinks } from "../content/siteContent.js";
import {
  INFLATION_CODE_URL,
  INFLATION_PROJECT_PATH,
  INTEREST_CODE_URL,
  INTEREST_PROJECT_PATH,
  MINI_PROJECTS_PATH,
  WORLD_BANK_CPI_URL,
  miniProjects,
} from "../components/miniProjects/projectCatalog.js";
import {
  InflationApiError,
  buildChartSummary,
  buildResultSentences,
  calculatorReducer,
  initialCalculatorState,
  submitInflationCalculation,
  validateCalculatorInput,
} from "./inflationProject.js";
import { safeExternalUrl } from "./safeUrl.js";
import { HOME_SECTIONS, resolveRoute } from "./routes.js";

const validValues = {
  country: "TUR",
  startYear: "2010",
  endYear: "2024",
  amount: "100",
};

const result = {
  country: { code: "TUR", name: "Türkiye" },
  start_year: 2010,
  end_year: 2024,
  amount: 100,
  start_cpi: 100,
  end_cpi: 250,
  cumulative_inflation_percent: 150,
  equivalent_end_year_amount: 250,
  same_nominal_amount_start_year_value: 40,
  series: [
    { year: 2010, value: 100 },
    { year: 2024, value: 250 },
  ],
};

describe("Mini Projects discovery", () => {
  it("keeps Mini Projects visible in header and footer navigation", () => {
    assert.ok(headerLinks.some((link) => link.href === MINI_PROJECTS_PATH && link.mobileVisible));
    assert.ok(footerLinks.some((link) => link.href === MINI_PROJECTS_PATH));
  });

  it("publishes exactly the two completed mini projects", () => {
    assert.equal(miniProjects.length, 2);
    assert.equal(miniProjects[0].status, "Complete");
    assert.equal(miniProjects[0].path, INFLATION_PROJECT_PATH);
    assert.match(miniProjects[0].title, /money really worth/i);
    assert.equal(miniProjects[1].status, "Complete");
    assert.equal(miniProjects[1].path, INTEREST_PROJECT_PATH);
    assert.match(miniProjects[1].title, /interest, growth, and inflation/i);
  });

  it("adds project routes without changing homepage sections", () => {
    assert.deepEqual(HOME_SECTIONS, ["about", "certificates", "contact"]);
    assert.equal(resolveRoute(MINI_PROJECTS_PATH).name, "miniProjects");
    assert.equal(resolveRoute(INFLATION_PROJECT_PATH).name, "inflationProject");
    assert.equal(resolveRoute(INTEREST_PROJECT_PATH).name, "interestInflationProject");
  });
});

describe("Inflation calculator controller", () => {
  it("accepts a valid calculator submission", async () => {
    let requestedUrl = "";
    const fetchImpl = async (url) => {
      requestedUrl = url;
      return { ok: true, status: 200, json: async () => result };
    };

    const response = await submitInflationCalculation(validValues, { fetchImpl });

    assert.equal(response.equivalent_end_year_amount, 250);
    assert.match(requestedUrl, /country=TUR/);
    assert.match(requestedUrl, /start_year=2010/);
  });

  it("returns field validation errors", () => {
    const errors = validateCalculatorInput(
      { country: "XXX", startYear: "2024", endYear: "2010", amount: "NaN" },
      { countryCodes: ["TUR"], minimumYear: 1960, maximumYear: 2024 },
    );

    assert.ok(errors.country);
    assert.ok(errors.endYear);
    assert.ok(errors.amount);
  });

  it("represents loading, API error, and successful result states", () => {
    const loading = calculatorReducer(initialCalculatorState, { type: "loading" });
    const failed = calculatorReducer(loading, { type: "error", error: "Unavailable" });
    const success = calculatorReducer(failed, { type: "success", result });

    assert.equal(loading.status, "loading");
    assert.equal(failed.status, "error");
    assert.equal(failed.error, "Unavailable");
    assert.equal(success.status, "success");
    assert.equal(success.result.country.code, "TUR");
  });

  it("uses a helpful controlled API error", async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 502,
      json: async () => ({ detail: "World Bank data is temporarily unavailable." }),
    });

    await assert.rejects(
      submitInflationCalculation(validValues, { fetchImpl }),
      (error) => error instanceof InflationApiError && error.status === 502,
    );
  });

  it("builds neutral result copy", () => {
    const sentences = buildResultSentences(result);

    assert.equal(sentences.length, 3);
    assert.match(sentences[0], /CPI moved from 100/);
    assert.match(sentences[2], /based on national CPI/);
  });

  it("describes deflation without a double negative", () => {
    const sentences = buildResultSentences({
      ...result,
      cumulative_inflation_percent: -20,
    });

    assert.equal(sentences[1], "The general price level decreased by approximately 20%.");
  });
});

describe("Project source, code, and chart accessibility", () => {
  it("uses safe official source and GitHub links", () => {
    const options = { allowHttp: false, baseUrl: "https://atilahatefi.ir" };
    assert.equal(safeExternalUrl(WORLD_BANK_CPI_URL, options), WORLD_BANK_CPI_URL);
    assert.equal(safeExternalUrl(INFLATION_CODE_URL, options), INFLATION_CODE_URL);
    assert.equal(safeExternalUrl(INTEREST_CODE_URL, options), INTEREST_CODE_URL);
  });

  it("creates a useful chart text alternative", () => {
    const summary = buildChartSummary(result.series, result.country.name);

    assert.match(summary, /Türkiye/);
    assert.match(summary, /2010/);
    assert.match(summary, /2024/);
    assert.match(summary, /2 annual observations/);
  });

  it("keeps required accessibility and external-link attributes in components", async () => {
    const pageSource = await readFile(
      new URL("../components/miniProjects/InflationPurchasingPowerPage.jsx", import.meta.url),
      "utf8",
    );
    const chartSource = await readFile(
      new URL("../components/miniProjects/ProjectChart.jsx", import.meta.url),
      "utf8",
    );
    const codeSource = await readFile(
      new URL("../components/miniProjects/ProjectCodeLink.jsx", import.meta.url),
      "utf8",
    );

    assert.match(pageSource, /aria-live="polite"/);
    assert.match(pageSource, /aria-invalid/);
    assert.match(chartSource, /role="img"/);
    assert.match(chartSource, /<desc/);
    assert.match(codeSource, /target="_blank"/);
    assert.match(codeSource, /rel="noopener noreferrer"/);
  });
});
