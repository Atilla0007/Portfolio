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

function ProjectChart({ series = [], countryName = "" }) {
  const summary = buildChartSummary(series, countryName);
  if (!series.length) {
    return <p className="project-chart-empty">{summary}</p>;
  }

  const { minimum, maximum, points } = chartGeometry(series);
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const titleId = "cpi-chart-title";
  const descriptionId = "cpi-chart-description";

  return (
    <figure className="project-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
      >
        <title id={titleId}>Consumer price index over the selected period</title>
        <desc id={descriptionId}>{summary}</desc>
        <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} />
        <line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
        />
        <polyline className="project-chart-line" points={polyline} />
        {points.map((point) => (
          <circle key={point.year} cx={point.x} cy={point.y} r="4">
            <title>{`${point.year}: ${formatNumber(point.value, { maximumFractionDigits: 4 })}`}</title>
          </circle>
        ))}
        <text x={PADDING} y={HEIGHT - 12}>{series[0].year}</text>
        <text x={WIDTH - PADDING} y={HEIGHT - 12} textAnchor="end">
          {series[series.length - 1].year}
        </text>
        <text x={PADDING + 8} y={PADDING + 5}>
          {formatNumber(maximum, { maximumFractionDigits: 2 })}
        </text>
        <text x={PADDING + 8} y={HEIGHT - PADDING - 8}>
          {formatNumber(minimum, { maximumFractionDigits: 2 })}
        </text>
      </svg>
      <figcaption>{summary}</figcaption>
    </figure>
  );
}

export { chartGeometry };
export default ProjectChart;
