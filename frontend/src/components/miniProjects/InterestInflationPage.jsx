import { useMemo, useReducer, useState } from "react";

import {
  COMPOUNDING_OPTIONS,
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
} from "../../utils/interestInflationProject.js";
import { formatNumber } from "../../utils/inflationProject.js";
import MiniProjectLayout from "./MiniProjectLayout.jsx";
import ProjectChart from "./ProjectChart.jsx";
import ProjectCodeLink from "./ProjectCodeLink.jsx";
import ProjectExplanation from "./ProjectExplanation.jsx";
import ProjectMetric from "./ProjectMetric.jsx";
import ProjectSourceList from "./ProjectSourceList.jsx";
import {
  INTEREST_CODE_URL,
  WORLD_BANK_INFLATION_URL,
  miniProjects,
} from "./projectCatalog.js";


const project = miniProjects.find((item) => item.slug === "interest-compound-growth-inflation");
const DEFAULT_PRESET = Object.freeze({ country: "TUR", startYear: "2010", endYear: "2020" });
const CURRENT_YEAR = new Date().getFullYear();

function descriptionId(name, error) {
  return error ? `${name}-error` : undefined;
}

function InterestInflationPage() {
  const [values, setValues] = useState({ ...DEFAULT_INTEREST_VALUES });
  const [state, dispatch] = useReducer(interestCalculatorReducer, initialInterestState);
  const [presetEnabled, setPresetEnabled] = useState(false);
  const [presetValues, setPresetValues] = useState({ ...DEFAULT_PRESET });
  const [presetStatus, setPresetStatus] = useState("idle");
  const [presetError, setPresetError] = useState("");
  const [historicalPreset, setHistoricalPreset] = useState(null);
  const fields = state.fieldErrors;

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (name === "annualInflationRate") {
      setHistoricalPreset(null);
    }
    if (state.status !== "loading") {
      dispatch({ type: "reset" });
    }
  }

  function resetExample() {
    setValues({ ...DEFAULT_INTEREST_VALUES });
    setPresetValues({ ...DEFAULT_PRESET });
    setPresetEnabled(false);
    setPresetStatus("idle");
    setPresetError("");
    setHistoricalPreset(null);
    dispatch({ type: "reset" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.status === "loading") {
      return;
    }
    const fieldErrors = validateInterestInput(values);
    if (Object.keys(fieldErrors).length) {
      dispatch({ type: "validation-error", fieldErrors });
      return;
    }

    dispatch({ type: "loading" });
    try {
      const result = await submitInterestCalculation(values);
      dispatch({ type: "success", result });
    } catch (error) {
      dispatch({
        type: "error",
        error: error instanceof InterestInflationApiError
          ? error.message
          : "The calculation could not be completed. Please try again.",
        fieldErrors: error instanceof InterestInflationApiError ? error.fieldErrors : {},
      });
    }
  }

  async function applyHistoricalPreset(event) {
    event.preventDefault();
    if (presetStatus === "loading") {
      return;
    }
    const start = Number(presetValues.startYear);
    const end = Number(presetValues.endYear);
    if (
      !Number.isInteger(start)
      || !Number.isInteger(end)
      || start < 1960
      || end < start
      || end > CURRENT_YEAR
    ) {
      setPresetStatus("error");
      setPresetError("Choose a valid period from 1960 onward, with the end year after the start year.");
      return;
    }

    setPresetStatus("loading");
    setPresetError("");
    try {
      const result = await loadHistoricalInflation(presetValues);
      setValues((current) => ({
        ...current,
        annualInflationRate: String(result.annualised_inflation_rate),
      }));
      setHistoricalPreset(result);
      setPresetStatus("success");
      dispatch({ type: "reset" });
    } catch (error) {
      setPresetStatus("error");
      setPresetError(
        error instanceof InterestInflationApiError
          ? error.message
          : "Historical inflation could not be loaded. Manual inflation input remains available.",
      );
    }
  }

  const result = state.result;
  const chartDatasets = useMemo(() => buildGrowthDatasets(result?.series), [result]);
  const resultSentences = buildGrowthResultSentences(result);
  const disabled = state.status === "loading";

  return (
    <MiniProjectLayout number="02" title={project.title} subtitle={project.subtitle}>
      <section className="project-calculator section-shell" aria-labelledby="interest-calculator-title">
        <div className="project-tool-heading">
          <p className="eyebrow">Interactive calculator</p>
          <h2 id="interest-calculator-title">Compare growth with purchasing power.</h2>
          <p>Test fixed educational assumptions. The results are not financial advice or an investment forecast.</p>
        </div>

        <form className="project-form" onSubmit={handleSubmit} noValidate>
          <div className="project-fields interest-fields">
            <label htmlFor="interest-principal">
              <span>Initial amount</span>
              <input id="interest-principal" name="principal" type="number" inputMode="decimal" min="0.01" max="1000000000" step="0.01" value={values.principal} onChange={updateValue} disabled={disabled} aria-invalid={Boolean(fields.principal)} aria-describedby={descriptionId("principal", fields.principal)} />
              {fields.principal && <small id="principal-error" className="field-error">{fields.principal}</small>}
            </label>
            <label htmlFor="interest-rate">
              <span>Annual interest rate (% per year)</span>
              <input id="interest-rate" name="annualInterestRate" type="number" inputMode="decimal" min="0" max="100" step="0.01" value={values.annualInterestRate} onChange={updateValue} disabled={disabled} aria-invalid={Boolean(fields.annualInterestRate)} aria-describedby={descriptionId("annual-interest-rate", fields.annualInterestRate)} />
              {fields.annualInterestRate && <small id="annual-interest-rate-error" className="field-error">{fields.annualInterestRate}</small>}
            </label>
            <label htmlFor="interest-years">
              <span>Number of years</span>
              <input id="interest-years" name="years" type="number" inputMode="numeric" min="1" max="100" step="1" value={values.years} onChange={updateValue} disabled={disabled} aria-invalid={Boolean(fields.years)} aria-describedby={descriptionId("years", fields.years)} />
              {fields.years && <small id="years-error" className="field-error">{fields.years}</small>}
            </label>
            <label htmlFor="interest-frequency">
              <span>Compounding frequency</span>
              <select id="interest-frequency" name="compoundsPerYear" value={values.compoundsPerYear} onChange={updateValue} disabled={disabled} aria-invalid={Boolean(fields.compoundsPerYear)} aria-describedby={descriptionId("compounds-per-year", fields.compoundsPerYear)}>
                {COMPOUNDING_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              {fields.compoundsPerYear && <small id="compounds-per-year-error" className="field-error">{fields.compoundsPerYear}</small>}
            </label>
            <label htmlFor="inflation-rate">
              <span>Expected inflation rate (% per year)</span>
              <input id="inflation-rate" name="annualInflationRate" type="number" inputMode="decimal" min="-20" max="100" step="0.01" value={values.annualInflationRate} onChange={updateValue} disabled={disabled} aria-invalid={Boolean(fields.annualInflationRate)} aria-describedby={descriptionId("annual-inflation-rate", fields.annualInflationRate)} />
              {fields.annualInflationRate && <small id="annual-inflation-rate-error" className="field-error">{fields.annualInflationRate}</small>}
            </label>
          </div>
          <div className="project-form-actions">
            <button className="project-calculate-button" type="submit" disabled={disabled}>
              {disabled ? "Calculating..." : "Calculate values"}
            </button>
            <button className="project-secondary-button" type="button" onClick={resetExample} disabled={disabled}>
              Reset to example
            </button>
          </div>
        </form>

        <div className="historical-preset">
          <label className="project-toggle" htmlFor="historical-preset-toggle">
            <input id="historical-preset-toggle" type="checkbox" checked={presetEnabled} onChange={(event) => setPresetEnabled(event.target.checked)} />
            <span>Use a historical inflation preset</span>
          </label>
          {presetEnabled && (
            <form className="historical-preset-form" onSubmit={applyHistoricalPreset}>
              <label htmlFor="preset-country"><span>Country</span><select id="preset-country" value={presetValues.country} onChange={(event) => setPresetValues((current) => ({ ...current, country: event.target.value }))}><option value="TUR">Türkiye</option><option value="IRN">Iran</option></select></label>
              <label htmlFor="preset-start"><span>Start year</span><input id="preset-start" type="number" min="1960" max={CURRENT_YEAR} value={presetValues.startYear} onChange={(event) => setPresetValues((current) => ({ ...current, startYear: event.target.value }))} /></label>
              <label htmlFor="preset-end"><span>End year</span><input id="preset-end" type="number" min="1960" max={CURRENT_YEAR} value={presetValues.endYear} onChange={(event) => setPresetValues((current) => ({ ...current, endYear: event.target.value }))} /></label>
              <button className="project-secondary-button" type="submit" disabled={presetStatus === "loading"}>{presetStatus === "loading" ? "Loading preset..." : "Apply historical rate"}</button>
            </form>
          )}
          {presetStatus === "error" && <p className="preset-message preset-error" role="alert">{presetError}</p>}
          {presetStatus === "success" && historicalPreset && (
            <div className="preset-message" role="status">
              <strong>{historicalPreset.label}</strong>
              <span>{formatNumber(historicalPreset.annualised_inflation_rate, { maximumFractionDigits: 4 })}% from {historicalPreset.observations_used} observations.</span>
              <span>Cumulative price change: {formatNumber(historicalPreset.cumulative_price_change_percent, { maximumFractionDigits: 4 })}%.</span>
              {historicalPreset.missing_years.length > 0 && <span>Missing years: {historicalPreset.missing_years.join(", ")}.</span>}
            </div>
          )}
        </div>

        <div className="project-result" aria-live="polite" aria-atomic="true">
          {state.status === "idle" && <div className="project-state">Nominal and inflation-adjusted results will appear here.</div>}
          {state.status === "loading" && <div className="project-state" role="status">Calculating every year...</div>}
          {(state.status === "error" || state.status === "validation-error") && <div className="project-state project-state-error" role="alert"><p>{state.error}</p></div>}
          {state.status === "success" && result && (
            <>
              <section className="result-group" aria-labelledby="nominal-results-title">
                <h3 id="nominal-results-title">Nominal value</h3>
                <div className="project-metrics">
                  <ProjectMetric label="Cash, no interest" value={formatNumber(result.summary.cash_nominal)} detail={`After ${result.inputs.years} years`} />
                  <ProjectMetric label="Simple interest" value={formatNumber(result.summary.simple_nominal)} detail="Principal plus linear interest" />
                  <ProjectMetric label="Compound interest" value={formatNumber(result.summary.compound_nominal)} detail="Interest earned on prior growth" />
                </div>
              </section>
              <section className="result-group" aria-labelledby="real-results-title">
                <h3 id="real-results-title">Inflation-adjusted real value</h3>
                <div className="project-metrics">
                  <ProjectMetric label="Cash, real" value={formatNumber(result.summary.cash_real)} detail="In year-0 purchasing power" />
                  <ProjectMetric label="Simple interest, real" value={formatNumber(result.summary.simple_real)} detail="In year-0 purchasing power" />
                  <ProjectMetric label="Compound interest, real" value={formatNumber(result.summary.compound_real)} detail="In year-0 purchasing power" />
                </div>
              </section>
              <div className="project-metrics project-metrics-secondary">
                <ProjectMetric label="Compound minus simple" value={formatNumber(result.summary.compound_minus_simple)} detail="Nominal difference" />
                <ProjectMetric label="Effective annual interest" value={`${formatNumber(result.summary.effective_annual_interest_rate, { maximumFractionDigits: 4 })}%`} detail="Includes compounding frequency" />
                <ProjectMetric label="Exact real annual return" value={`${formatNumber(result.summary.exact_real_annual_return, { maximumFractionDigits: 4 })}%`} detail="Adjusted for inflation" />
              </div>
              <ul className="project-warnings" aria-label="Calculation notes">
                {result.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
              <ProjectChart datasets={chartDatasets} title="Nominal and inflation-adjusted values by year" summary={buildGrowthChartSummary(result)} />
              <GrowthTable series={result.series} />
            </>
          )}
        </div>
      </section>

      <ProjectExplanation number="01" title="Question"><blockquote>How do simple interest, compound growth, and inflation affect the future nominal and real value of money?</blockquote></ProjectExplanation>
      <ProjectExplanation number="02" title="Economics concept">
        <p><strong>Principal</strong> is the initial amount. <strong>Percentage growth</strong> measures change relative to that starting point.</p>
        <p><strong>Simple interest</strong> adds interest only on the principal. <strong>Compound interest</strong> also earns growth on earlier interest, and <strong>compounding frequency</strong> says how often that update occurs.</p>
        <p><strong>Inflation</strong> describes broad price growth. A <strong>nominal value</strong> is the amount shown, while <strong>real purchasing power</strong> adjusts it for changing prices.</p>
        <p>The <strong>time value of money</strong> connects these ideas: an amount today and the same nominal amount later may not buy the same basket.</p>
      </ProjectExplanation>
      <ProjectExplanation number="03" title="Method">
        <ol><li>Keep the cash amount unchanged.</li><li>Calculate simple-interest growth.</li><li>Calculate compound growth at the selected frequency.</li><li>Calculate the cumulative inflation price factor.</li><li>Divide each nominal value by that factor.</li><li>Compare every path from year 0 to the final year.</li><li>Optionally use historical World Bank inflation as the manual input preset.</li></ol>
        <div className="project-formulas" aria-label="Interest and inflation formulas"><code>A_simple = P x (1 + r x t)</code><code>A_compound = P x (1 + r / n)^(n x t)</code><code>Inflation factor = (1 + i)^t</code><code>Real value = Nominal value / Inflation factor</code><code>EAR = (1 + r / n)^n - 1</code><code>Real rate = ((1 + EAR) / (1 + i)) - 1</code></div>
      </ProjectExplanation>
      <ProjectExplanation number="04" title="Technology"><ul><li>Python pure calculation functions and Decimal arithmetic</li><li>Django and Django REST Framework serializer validation</li><li>Optional fixed-host World Bank API integration with Django caching</li><li>React and accessible multi-series SVG charting</li><li>Automated backend and frontend tests</li></ul></ProjectExplanation>
      <ProjectExplanation number="05" title="Results">
        {resultSentences.length ? resultSentences.map((sentence) => <p key={sentence}>{sentence}</p>) : <p>Run the calculator to compare nominal growth with inflation-adjusted purchasing power under fixed assumptions.</p>}
      </ProjectExplanation>
      <ProjectExplanation number="06" title="Limitations"><ul><li>Interest and manual inflation rates are assumed constant, although real-world rates change.</li><li>Taxes, fees, risk, deposits, and withdrawals are excluded.</li><li>The calculator does not predict investments or markets.</li><li>Historical inflation does not predict future inflation.</li><li>National inflation may differ from personal experience.</li><li>Daily compounding is simplified to 365 periods.</li><li>Results are educational, not financial advice.</li></ul></ProjectExplanation>
      <ProjectExplanation number="07" title="Source">
        {historicalPreset ? <ProjectSourceList sources={[{ name: historicalPreset.source.name, detail: `Indicator: ${historicalPreset.source.indicator} / Inflation, consumer prices (annual %)`, url: WORLD_BANK_INFLATION_URL }]} /> : <p>No external data source is required. Calculations use the values entered by the user.</p>}
      </ProjectExplanation>
      <ProjectExplanation number="08" title="Code"><p>The pure financial mathematics, validation, optional historical client, APIs, and tests are public in the project repository.</p><ProjectCodeLink href={INTEREST_CODE_URL} /></ProjectExplanation>
    </MiniProjectLayout>
  );
}

function GrowthTable({ series }) {
  return (
    <div className="project-table-wrap" tabIndex="0" aria-label="Scrollable year-by-year results">
      <table className="project-table">
        <caption>Year-by-year nominal and inflation-adjusted values</caption>
        <thead><tr><th scope="col">Year</th><th scope="col">Cash nominal</th><th scope="col">Cash real</th><th scope="col">Simple nominal</th><th scope="col">Simple real</th><th scope="col">Compound nominal</th><th scope="col">Compound real</th></tr></thead>
        <tbody>{series.map((item) => <tr key={item.year}><th scope="row">{item.year}</th><td>{formatNumber(item.cash_nominal)}</td><td>{formatNumber(item.cash_real)}</td><td>{formatNumber(item.simple_nominal)}</td><td>{formatNumber(item.simple_real)}</td><td>{formatNumber(item.compound_nominal)}</td><td>{formatNumber(item.compound_real)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export { GrowthTable };
export default InterestInflationPage;
