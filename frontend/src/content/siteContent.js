const SITE_URL = "https://atilahatefi.ir";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/why-economics", label: "Why Economics" },
  { href: "/study-and-skills", label: "Study & Skills" },
  { href: "/notes", label: "Notes" },
  { href: "/activities", label: "Activities" },
  { href: "/cv", label: "CV" },
  { href: "/#contact", label: "Contact" },
];

const pageMeta = {
  home: {
    title: "Atila Hatefi | Economics, Computing, and Curiosity",
    description:
      "Personal portfolio of Atila Hatefi, connecting Economics, mathematics, programming, sports, culture, and careful thinking.",
    path: "/",
  },
  whyEconomics: {
    title: "Why Economics | Atila Hatefi",
    description:
      "A personal essay on how Tabriz, exchange rates, mathematics, programming, and curiosity shaped Atila Hatefi's interest in Economics.",
    path: "/why-economics",
  },
  academicProfile: {
    title: "Study & Skills | Atila Hatefi",
    description:
      "A factual view of Atila Hatefi's studies, examination results, languages, technical learning, and areas of curiosity.",
    path: "/study-and-skills",
  },
  activities: {
    title: "Activities | Atila Hatefi",
    description:
      "Sports, technology, music, travel, strategy games, and cultural interests that shape Atila Hatefi's way of learning.",
    path: "/activities",
  },
  blog: {
    title: "Notes | Atila Hatefi",
    description:
      "Personal notes by Atila Hatefi on Economics, computing, econometrics, exchange rates, artificial intelligence, and evidence.",
    path: "/notes",
  },
  cv: {
    title: "CV | Atila Hatefi",
    description:
      "A compact CV for Atila Hatefi covering study, results, technical learning, activities, languages, and portfolio links.",
    path: "/cv",
  },
  notFound: {
    title: "Page Not Found | Atila Hatefi",
    description: "The requested page was not found on Atila Hatefi's portfolio.",
    path: "/404",
  },
};

const whyEconomics = {
  eyebrow: "Why Economics",
  title: "Economics became real before it became formal.",
  intro:
    "I became interested in Economics because it explains the decisions, uncertainty, trade, prices, and systems I could already see around me.",
  pullQuote: "Economics helps me understand the world; computing helps me study it with structure.",
  sections: [
    {
      heading: "A border city made Economics visible",
      paragraphs: [
        "I grew up in Tabriz, a city with close trade connections to Türkiye. In a place like Tabriz, economic change does not feel distant. It appears in prices, exchange-rate conversations, inventory choices, and the way people adjust plans when conditions shift.",
        "Those observations did not give me answers. They gave me questions. Why do some businesses react quickly to uncertainty while others wait? How do exchange rates shape everyday choices? How do institutions, incentives, and expectations influence opportunity?",
        "This is why Economics feels personal to me. It is not only about abstract models. It is about understanding real decisions without pretending that a single observation explains everything.",
      ],
    },
    {
      heading: "Mathematics taught me patience",
      paragraphs: [
        "My high-school background in Mathematics and Physics shaped how I approach problems. Mathematics trained me to slow down, define the problem clearly, and follow the logic even when the answer is not immediate.",
        "That habit matters in Economics. Markets, policies, and institutions form systems. They are complex, but they are not random. To understand them, I need both curiosity and discipline.",
        "I am especially drawn to econometrics and quantitative analysis because they connect questions to evidence. They ask what can be measured, what should be doubted, and what can be concluded carefully.",
      ],
    },
    {
      heading: "Programming changed how I think",
      paragraphs: [
        "Programming began as a technical interest, but it gradually changed the way I think. Python, Django, and web systems taught me to break ideas into steps, organise information, check inputs, and make assumptions visible.",
        "Code is unforgiving in a useful way. A vague idea has to become a structure. A hidden mistake has to be found. A result should be reproducible. These habits connect naturally to the kind of Economics I want to study.",
        "For me, computing is not a separate identity from Economics. It is a method for working with data, building discipline, and learning how to test ideas instead of only believing them.",
      ],
    },
    {
      heading: "The questions that keep pulling me",
      paragraphs: [
        "I keep returning to questions about incentives, markets, institutions, development, and policy. Why do similar choices create different outcomes in different places? How can opportunity be measured? What does evidence show, and what does it fail to show?",
        "Development economics interests me because it deals with opportunity and long-term improvement. Applied economics interests me because it stays close to real decisions. Econometrics interests me because it demands evidence without pretending evidence is simple.",
        "I do not see technology as a shortcut to truth. Data can be incomplete, models can be limited, and speed can create overconfidence. That is exactly why careful study matters.",
      ],
    },
    {
      heading: "Where this is taking me",
      paragraphs: [
        "I want Economics to become the centre of my studies, especially the quantitative and applied sides of the field. I want to work with real datasets, modern analytical tools, and questions that connect to human outcomes.",
        "Türkiye also feels meaningful to me. I have visited regularly since early childhood, and Turkish language and culture feel familiar through travel and media. Its regional economic position makes it a natural place for me to think about trade, development, markets, and policy.",
        "I am still at the beginning. What I know is that I want to keep building the habits that matter: precision from mathematics, structure from programming, perspective from life in Tabriz, and curiosity from Economics.",
      ],
    },
  ],
};

const academicProfileGroups = [
  {
    title: "Education",
    items: [
      ["High-school field", "Mathematics and Physics / Science"],
      ["High-school GPA", "17.97 / 20"],
      ["School name", "Preferred English wording to be confirmed"],
    ],
  },
  {
    title: "Exam Results",
    items: [
      ["TR-YOS", "446.80 / 500"],
      ["Previous TR-YOS attempt", "438 / 500"],
      ["SAT", "On its way"],
      ["TOEFL iBT", "5/6"],
    ],
  },
  {
    title: "Mathematical Foundation",
    body:
      "Mathematics and Physics helped me develop logical reasoning, precision, problem decomposition, persistence with difficult questions, and comfort with quantitative work. I also participated in the International Mathematics Without Borders Tournament in 2017 and 2018.",
  },
  {
    title: "Computing and Systems",
    items: [
      ["Python Programming", "110 hours, score 88/100, completed in 2024"],
      ["Web Design Fundamentals - HTML and CSS", "422 hours, score 87/100, completed in 2024"],
      ["Web Development with Django Framework", "120 hours, score 75/100, completed in 2024"],
    ],
  },
  {
    title: "Languages",
    items: [
      ["Azerbaijani", "Native"],
      ["Persian", "Advanced"],
      ["Turkish", "Intermediate"],
      ["English", "TOEFL iBT 5/6"],
    ],
  },
  {
    title: "Economics Interests",
    tags: [
      "Econometrics",
      "Applied economic analysis",
      "Quantitative economics",
      "Development economics",
      "Evidence-based policy analysis",
    ],
  },
  {
    title: "What I Am Building Toward",
    body:
      "I want to keep developing as someone who can ask careful economic questions, work with data responsibly, and use programming as a practical tool for structure, organisation, and evidence.",
  },
];

const activitiesGroups = [
  {
    title: "Team Sports",
    paragraphs: [
      "Team sports have been one of the most consistent parts of my life. Basketball and volleyball taught me that progress depends on more than individual effort. A team needs timing, communication, trust, and the ability to stay calm when the game becomes tense.",
      "My verified basketball results include second place in 2017, second place in 2018, second place in 2023, and third place in 2024. In volleyball, I achieved second place in 2019.",
      "What stayed with me most is not only the placement. It is the discipline of practice, the responsibility of showing up, and the feeling that your own decisions affect people around you.",
    ],
  },
  {
    title: "Individual and Strategic Sports",
    paragraphs: [
      "I am also interested in football, tennis, and intelligence and strategy games. These interests are not listed as competition results; they are part of how I think and relax.",
      "Tennis requires concentration and adjustment. Strategy games reward patience and consequence-thinking. Both connect to the way I enjoy learning: observing a system, noticing patterns, and choosing carefully.",
    ],
  },
  {
    title: "Technology and Independent Learning",
    paragraphs: [
      "Technology and computer science are central to my independent learning. Through Python, HTML, CSS, Django, and React, I learned how ideas become structured systems.",
      "Programming taught me that assumptions should be tested, inputs should be checked, and results should be understandable. That habit has shaped the way I think beyond code.",
    ],
  },
  {
    title: "Music and Cultural Curiosity",
    paragraphs: [
      "Music gives me another way to understand rhythm, culture, and expression. It balances the technical parts of my life and reminds me that not every form of understanding is numerical.",
      "I am also interested in scientific discoveries, technological innovation, and learning about other cultures. Those interests keep my curiosity wider than one subject.",
    ],
  },
  {
    title: "Travel and Perspective",
    paragraphs: [
      "I have visited Türkiye regularly since early childhood, and that familiarity shaped how I see language, culture, and regional connection.",
      "Travel has helped me notice how geography, institutions, trade, and opportunity affect everyday life. It does not replace study; it gives me more reasons to study carefully.",
    ],
  },
];

const cvSections = [
  {
    title: "Profile",
    body:
      "Student interested in Economics, quantitative thinking, programming, and evidence-based analysis. My background connects Mathematics and Physics with Python, Django, structured systems, sports discipline, and curiosity about markets, institutions, incentives, and technology.",
  },
  {
    title: "Education",
    items: [
      "High-school field: Mathematics and Physics / Science",
      "High-school GPA: 17.97 / 20",
      "School name in English: to confirm",
    ],
  },
  {
    title: "Exam Results",
    items: [
      "TR-YOS: 446.80 / 500",
      "Previous TR-YOS attempt: 438 / 500",
      "SAT: on its way",
      "TOEFL iBT: 5/6",
    ],
  },
  {
    title: "Economics Interests",
    items: [
      "Econometrics",
      "Applied economic analysis",
      "Quantitative economics",
      "Development economics",
      "Evidence-based policy analysis",
    ],
  },
  {
    title: "Selected Learning",
    items: [
      "Python Programming, 110 hours, score 88/100, 2024",
      "Web Design Fundamentals - HTML and CSS, 422 hours, score 87/100, 2024",
      "Web Development with Django Framework, 120 hours, score 75/100, 2024",
      "International Mathematics Without Borders Tournament, participation in 2017 and 2018",
    ],
  },
  {
    title: "Technical Skills",
    items: ["Python", "Django", "HTML and CSS", "React/Vite", "Data organisation", "Automation fundamentals"],
  },
  {
    title: "Activities",
    items: [
      "Basketball: second place in 2017, 2018, 2023; third place in 2024",
      "Volleyball: second place in 2019",
      "Additional interests: football, tennis, AI, music, strategy games, travel, scientific discoveries, technological innovation",
    ],
  },
  {
    title: "Languages",
    items: ["Azerbaijani: Native", "Persian: Advanced", "Turkish: Intermediate", "English: TOEFL iBT 5/6"],
  },
];

const confirmationItems = [
  "Preferred English wording of school name",
  "Whether certificate scans have been redacted",
  "Whether all sports dates and placements should be displayed publicly",
];

export {
  SITE_URL,
  academicProfileGroups,
  activitiesGroups,
  confirmationItems,
  cvSections,
  footerLinks,
  pageMeta,
  whyEconomics,
};
