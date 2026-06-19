import { useEffect, useMemo, useReducer, useState } from "react";

import {
  InflationApiError,
  buildResultSentences,
  calculatorReducer,
  formatNumber,
  initialCalculatorState,
  loadInflationCountries,
  submitInflationCalculation,
  validateCalculatorInput,
} from "../../utils/inflationProject.js";
import MiniProjectLayout from "./MiniProjectLayout.jsx";
import ProjectChart from "./ProjectChart.jsx";
import ProjectCodeLink from "./ProjectCodeLink.jsx";
import ProjectExplanation from "./ProjectExplanation.jsx";
import ProjectMetric from "./ProjectMetric.jsx";
import ProjectSourceList from "./ProjectSourceList.jsx";
import {
  INFLATION_CODE_URL,
  WORLD_BANK_CPI_URL,
  miniProjects,
} from "./projectCatalog.js";

const project = miniProjects[0];

function fieldDescriptionId(name, error) {
  return error ? `${name}-error` : undefined;
}

function InflationPurchasingPowerPage() {
  const [metadata, setMetadata] = useState(null);
  const [metadataStatus, setMetadataStatus] = useState("loading");
  const [metadataError, setMetadataError] = useState("");
  const [values, setValues] = useState({
    country: "",
    startYear: "",
    endYear: "",
    amount: "100",
  });
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);

  async function loadMetadata(signal) {
    setMetadataStatus("loading");
    setMetadataError("");
    try {
      const data = await loadInflationCountries({ signal });
      setMetadata(data);
      setValues({
        country: data.defaults.country,
        startYear: String(data.defaults.start_year),
        endYear: String(data.defaults.end_year),
        amount: String(data.defaults.amount),
      });
      setMetadataStatus("success");
    } catch (error) {
      if (error.name !== "AbortError") {
        setMetadataStatus("error");
        setMetadataError(
          error instanceof InflationApiError
            ? error.message
            : "Country data could not be loaded. Please try again.",
        );
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadMetadata(controller.signal);
    return () => controller.abort();
  }, []);

  const countryCodes = useMemo(
    () => metadata?.countries?.map((country) => country.code) || [],
    [metadata],
  );
  const yearOptions = useMemo(() => {
    if (!metadata?.year_range) {
      return [];
    }
    const years = [];
    for (let year = metadata.year_range.maximum; year >= metadata.year_range.minimum; year -= 1) {
      years.push(year);
    }
    return years;
  }, [metadata]);

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (state.status !== "loading") {
      dispatch({ type: "reset" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.status === "loading" || metadataStatus !== "success") {
      return;
    }

    const fieldErrors = validateCalculatorInput(values, {
      countryCodes,
      minimumYear: metadata.year_range.minimum,
      maximumYear: metadata.year_range.maximum,
    });
    if (Object.keys(fieldErrors).length) {
      dispatch({ type: "validation-error", fieldErrors });
      return;
    }

    dispatch({ type: "loading" });
    try {
      const result = await submitInflationCalculation(values);
      dispatch({ type: "success", result });
    } catch (error) {
      dispatch({
        type: "error",
        error:
          error instanceof InflationApiError
            ? error.message
            : "The calculation could not be completed. Please try again.",
        fieldErrors: error instanceof InflationApiError ? error.fieldErrors : {},
        availableYears: error instanceof InflationApiError ? error.availableYears : [],
      });
    }
  }

  const resultSentences = buildResultSentences(state.result);
  const fields = state.fieldErrors;

  return (
    <MiniProjectLayout title={project.title} subtitle={project.subtitle}>
      <section className="project-calculator section-shell" aria-labelledby="calculator-title">
        <div className="project-tool-heading">
          <p className="eyebrow">Interactive calculator</p>
          <h2 id="calculator-title">Compare money across two years.</h2>
          <p>
            Choose exact years. Missing observations are reported rather than replaced with a different year.
          </p>
        </div>

        {metadataStatus === "loading" && (
          <div className="project-state" role="status">Loading countries and available years...</div>
        )}
        {metadataStatus === "error" && (
          <div className="project-state project-state-error" role="alert">
            <p>{metadataError}</p>
            <button type="button" onClick={() => loadMetadata()}>Try again</button>
          </div>
        )}

        {metadataStatus === "success" && (
          <form className="inflation-form" onSubmit={handleSubmit} noValidate>
            <div className="inflation-fields">
              <label htmlFor="inflation-country">
                <span>Country</span>
                <select
                  id="inflation-country"
                  name="country"
                  value={values.country}
                  onChange={updateValue}
                  disabled={state.status === "loading"}
                  aria-invalid={Boolean(fields.country)}
                  aria-describedby={fieldDescriptionId("country", fields.country)}
                >
                  {metadata.countries.map((country) => (
                    <option value={country.code} key={country.code}>{country.name}</option>
                  ))}
                </select>
                {fields.country && <small id="country-error" className="field-error">{fields.country}</small>}
              </label>

              <label htmlFor="inflation-start-year">
                <span>Start year</span>
                <select
                  id="inflation-start-year"
                  name="startYear"
                  value={values.startYear}
                  onChange={updateValue}
                  disabled={state.status === "loading"}
                  aria-invalid={Boolean(fields.startYear)}
                  aria-describedby={fieldDescriptionId("start-year", fields.startYear)}
                >
                  {yearOptions.map((year) => <option value={year} key={year}>{year}</option>)}
                </select>
                {fields.startYear && <small id="start-year-error" className="field-error">{fields.startYear}</small>}
              </label>

              <label htmlFor="inflation-end-year">
                <span>End year</span>
                <select
                  id="inflation-end-year"
                  name="endYear"
                  value={values.endYear}
                  onChange={updateValue}
                  disabled={state.status === "loading"}
                  aria-invalid={Boolean(fields.endYear)}
                  aria-describedby={fieldDescriptionId("end-year", fields.endYear)}
                >
                  {yearOptions.map((year) => <option value={year} key={year}>{year}</option>)}
                </select>
                {fields.endYear && <small id="end-year-error" className="field-error">{fields.endYear}</small>}
              </label>

              <label htmlFor="inflation-amount">
                <span>Amount</span>
                <input
                  id="inflation-amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max="999999999999.99"
                  step="0.01"
                  value={values.amount}
                  onChange={updateValue}
                  disabled={state.status === "loading"}
                  aria-invalid={Boolean(fields.amount)}
                  aria-describedby={fieldDescriptionId("amount", fields.amount)}
                />
                {fields.amount && <small id="amount-error" className="field-error">{fields.amount}</small>}
              </label>
            </div>
            <button className="project-calculate-button" type="submit" disabled={state.status === "loading"}>
              {state.status === "loading" ? "Calculating..." : "Calculate purchasing power"}
            </button>
          </form>
        )}

        <div className="project-result" aria-live="polite" aria-atomic="true">
          {state.status === "idle" && metadataStatus === "success" && (
            <div className="project-state">Results and the CPI chart will appear here.</div>
          )}
          {state.status === "loading" && <div className="project-state" role="status">Retrieving CPI observations...</div>}
          {(state.status === "error" || state.status === "validation-error") && (
            <div className="project-state project-state-error" role="alert">
              <p>{state.error}</p>
              {state.availableYears.length > 0 && (
                <p>Available years in this period: {state.availableYears.join(", ")}.</p>
              )}
            </div>
          )}
          {state.status === "success" && state.result && (
            <>
              <div className="project-metrics">
                <ProjectMetric
                  label="Cumulative price change"
                  value={`${formatNumber(state.result.cumulative_inflation_percent)}%`}
                  detail={`${state.result.start_year} to ${state.result.end_year}`}
                />
                <ProjectMetric
                  label="Equivalent end-year amount"
                  value={formatNumber(state.result.equivalent_end_year_amount)}
                  detail={`Matches ${formatNumber(state.result.amount)} in ${state.result.start_year}`}
                />
                <ProjectMetric
                  label="Same nominal amount's earlier value"
                  value={formatNumber(state.result.same_nominal_amount_start_year_value)}
                  detail={`Purchasing power measured in ${state.result.start_year}`}
                />
              </div>
              <ProjectChart series={state.result.series} countryName={state.result.country.name} />
            </>
          )}
        </div>
      </section>

      <ProjectExplanation number="01" title="Question">
        <blockquote>
          How does inflation change the amount of money required to purchase an equivalent general basket of goods and services across two years?
        </blockquote>
      </ProjectExplanation>

      <ProjectExplanation number="02" title="Economics concept">
        <p><strong>Inflation</strong> is a broad increase in prices over time.</p>
        <p><strong>Consumer price index</strong> tracks the price of a representative basket relative to a base period.</p>
        <p><strong>Percentage change</strong> compares the size of that movement with the starting value.</p>
        <p><strong>Nominal value</strong> is the number printed on the money; <strong>real purchasing power</strong> describes what it can buy.</p>
      </ProjectExplanation>

      <ProjectExplanation number="03" title="Method">
        <ol>
          <li>Retrieve annual CPI observations for the selected country and exact period.</li>
          <li>Compare the start-year and end-year CPI values.</li>
          <li>Calculate the cumulative percentage change.</li>
          <li>Adjust the amount using the CPI ratio.</li>
          <li>Display the observations as a time series.</li>
        </ol>
        <div className="project-formulas" aria-label="Purchasing power formulas">
          <code>Price factor = CPI end / CPI start</code>
          <code>Inflation % = ((CPI end / CPI start) - 1) x 100</code>
          <code>Equivalent amount = amount x price factor</code>
          <code>Same nominal amount's earlier value = amount / price factor</code>
        </div>
      </ProjectExplanation>

      <ProjectExplanation number="04" title="Technology">
        <ul>
          <li>Python and Decimal-based calculations</li>
          <li>Django and Django REST Framework</li>
          <li>World Bank Indicators API v2</li>
          <li>Validated fixed-host requests with timeout, size limit, caching, and throttling</li>
          <li>React and accessible dependency-free SVG charting</li>
          <li>Automated backend and frontend tests</li>
        </ul>
      </ProjectExplanation>

      <ProjectExplanation number="05" title="Results">
        {resultSentences.length ? (
          resultSentences.map((sentence) => <p key={sentence}>{sentence}</p>)
        ) : (
          <p>Run the calculator to generate a neutral interpretation of the selected CPI observations.</p>
        )}
        <p>National CPI is an average and does not imply that every household experienced the same change.</p>
      </ProjectExplanation>

      <ProjectExplanation number="06" title="Limitations">
        <ul>
          <li>National CPI is an average; personal spending patterns differ.</li>
          <li>Individual goods can move differently from the overall index.</li>
          <li>The project uses annual data, which may later be revised.</li>
          <li>CPI does not measure every dimension of living standards.</li>
          <li>The calculator is descriptive, not predictive.</li>
          <li>It cannot establish why inflation occurred.</li>
        </ul>
      </ProjectExplanation>

      <ProjectExplanation number="07" title="Source">
        <ProjectSourceList
          sources={[
            {
              name: "World Bank — World Development Indicators",
              detail: "Indicator: FP.CPI.TOTL / Consumer price index (2010 = 100)",
              url: WORLD_BANK_CPI_URL,
            },
          ]}
        />
      </ProjectExplanation>

      <ProjectExplanation number="08" title="Code">
        <p>The calculation, validation, World Bank client, API views, and tests are public in the project repository.</p>
        <ProjectCodeLink href={INFLATION_CODE_URL} />
      </ProjectExplanation>
    </MiniProjectLayout>
  );
}

export default InflationPurchasingPowerPage;
