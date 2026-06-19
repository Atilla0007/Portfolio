const MINI_PROJECTS_PATH = "/mini-projects";
const INFLATION_PROJECT_PATH = "/mini-projects/inflation-purchasing-power";
const INTEREST_PROJECT_PATH = "/mini-projects/interest-compound-growth-inflation";
const INFLATION_CODE_URL =
  "https://github.com/Atilla0007/Portfolio/tree/main/backend/portfolio/mini_projects/inflation_purchasing_power";
const WORLD_BANK_CPI_URL = "https://data.worldbank.org/indicator/FP.CPI.TOTL";
const INTEREST_CODE_URL =
  "https://github.com/Atilla0007/Portfolio/tree/main/backend/portfolio/mini_projects/interest_inflation_visualizer";
const WORLD_BANK_INFLATION_URL =
  "https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG";

const miniProjects = [
  {
    slug: "inflation-purchasing-power",
    path: INFLATION_PROJECT_PATH,
    number: "01",
    status: "Complete",
    title: "What Is Your Money Really Worth?",
    subtitle:
      "An inflation and purchasing-power calculator built with Python and World Bank data.",
    question: "How does inflation change what the same amount of money can buy?",
    economicsConcept: "Consumer prices, inflation, and real purchasing power.",
    tags: ["Economics", "Python", "World Bank API"],
    codeUrl: INFLATION_CODE_URL,
  },
  {
    slug: "interest-compound-growth-inflation",
    path: INTEREST_PROJECT_PATH,
    number: "02",
    status: "Complete",
    title: "Interest, Growth, and Inflation",
    subtitle:
      "A Python-powered educational calculator comparing cash, simple interest, compound growth, and inflation-adjusted purchasing power.",
    question: "How do growth and inflation change money over time?",
    economicsConcept: "Simple interest, compound growth, inflation, and real value.",
    tags: [
      "Python",
      "Django",
      "Financial Mathematics",
      "Compound Interest",
      "Inflation",
      "Data Visualisation",
    ],
    codeUrl: INTEREST_CODE_URL,
  },
];

export {
  INFLATION_CODE_URL,
  INFLATION_PROJECT_PATH,
  INTEREST_CODE_URL,
  INTEREST_PROJECT_PATH,
  MINI_PROJECTS_PATH,
  WORLD_BANK_CPI_URL,
  WORLD_BANK_INFLATION_URL,
  miniProjects,
};
