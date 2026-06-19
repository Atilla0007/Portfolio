import { useId } from "react";

import { buildChartSummary, formatNumber } from "../../utils/inflationProject.js";

const WIDTH = 800;
const HEIGHT = 300;
const PADDING = 42;

function chartGeometry(series) {
  const values = series.map((item) => Number(item.value));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const xStep = series.length > 1 ? (WIDTH - PADDING * 2) / (series.length - 1) : 0;
  const points = series.map((item, index) => ({
    ...item,
    x: PADDING + index * xStep,
    y: HEIGHT - PADDING - ((Number(item.value) - minimum) / range) * (HEIGHT - PADDING * 2),
  }));
  return { minimum, maximum, points };
}

function multiSeriesGeometry(datasets) {
  const values = datasets.flatMap((dataset) => dataset.series.map((item) => Number(item.value)));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const maximumLength = Math.max(...datasets.map((dataset) => dataset.series.length));
  const xStep = maximumLength > 1 ? (WIDTH - PADDING * 2) / (maximumLength - 1) : 0;
  return {
    minimum,
    maximum,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      points: dataset.series.map((item, index) => ({
        ...item,
        x: PADDING + index * xStep,
        y: HEIGHT - PADDING - ((Number(item.value) - minimum) / range) * (HEIGHT - PADDING * 2),
      })),
    })),
  };
}

function ProjectChart({
  series = [],
  countryName = "",
  datasets,
  summary: suppliedSummary,
  title = "Consumer price index over the selected period",
}) {
  const chartDatasets = datasets?.length
    ? datasets.filter((dataset) => dataset.series?.length)
    : [{ key: "cpi", label: "Consumer price index", series }];
  const summary = suppliedSummary || buildChartSummary(series, countryName);
  const id = useId().replaceAll(":", "");
  if (!chartDatasets.length) {
    return <p className="project-chart-empty">{summary}</p>;
  }

  const geometry = multiSeriesGeometry(chartDatasets);
  const firstSeries = chartDatasets[0].series;
  const titleId = `project-chart-title-${id}`;
  const descriptionId = `project-chart-description-${id}`;

  return (
    <figure className="project-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>{title}</title>
        <desc id={descriptionId}>{summary}</desc>
        <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} />
        <line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
        />
        {geometry.datasets.map((dataset, index) => (
          <polyline
            key={dataset.key}
            className={chartDatasets.length > 1
              ? `project-chart-line project-chart-line-${(index % 6) + 1}`
              : "project-chart-line"}
            points={dataset.points.map((point) => `${point.x},${point.y}`).join(" ")}
          >
            <title>{dataset.label}</title>
          </polyline>
        ))}
        {chartDatasets.length === 1 && geometry.datasets[0].points.map((point) => (
          <circle key={point.year} cx={point.x} cy={point.y} r="4">
            <title>{`${point.year}: ${formatNumber(point.value, { maximumFractionDigits: 4 })}`}</title>
          </circle>
        ))}
        <text x={PADDING} y={HEIGHT - 12}>{firstSeries[0].year}</text>
        <text x={WIDTH - PADDING} y={HEIGHT - 12} textAnchor="end">
          {firstSeries[firstSeries.length - 1].year}
        </text>
        <text x={PADDING + 8} y={PADDING + 5}>
          {formatNumber(geometry.maximum, { maximumFractionDigits: 2 })}
        </text>
        <text x={PADDING + 8} y={HEIGHT - PADDING - 8}>
          {formatNumber(geometry.minimum, { maximumFractionDigits: 2 })}
        </text>
      </svg>
      {chartDatasets.length > 1 && (
        <ul className="project-chart-legend" aria-label="Chart series">
          {chartDatasets.map((dataset, index) => (
            <li key={dataset.key} className={`project-chart-key project-chart-key-${(index % 6) + 1}`}>
              {dataset.label}
            </li>
          ))}
        </ul>
      )}
      <figcaption>{summary}</figcaption>
    </figure>
  );
}

export { chartGeometry, multiSeriesGeometry };
export default ProjectChart;
