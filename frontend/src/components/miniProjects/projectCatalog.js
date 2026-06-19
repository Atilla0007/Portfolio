const MINI_PROJECTS_PATH = "/mini-projects";
const INFLATION_PROJECT_PATH = "/mini-projects/inflation-purchasing-power";
const INFLATION_CODE_URL =
  "https://github.com/Atilla0007/Portfolio/tree/main/backend/portfolio/mini_projects/inflation_purchasing_power";
const WORLD_BANK_CPI_URL = "https://data.worldbank.org/indicator/FP.CPI.TOTL";

const miniProjects = [
  {
    slug: "inflation-purchasing-power",
    path: INFLATION_PROJECT_PATH,
    number: "01",
    status: "Complete",
    title: "What Is Your Money Really Worth?",
    subtitle:
      "An inflation and purchasing-power calculator built with Python and World Bank data.",
    tags: ["Economics", "Python", "World Bank API"],
    codeUrl: INFLATION_CODE_URL,
  },
];

export {
  INFLATION_CODE_URL,
  INFLATION_PROJECT_PATH,
  MINI_PROJECTS_PATH,
  WORLD_BANK_CPI_URL,
  miniProjects,
};
