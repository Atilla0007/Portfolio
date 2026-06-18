from datetime import datetime

from django.db import migrations
from django.utils import timezone


ACHIEVEMENTS = [
    {
        "title": "Python Programming",
        "issuer": "Iran Technical and Vocational Training Organization",
        "description": "Completed vocational training in Python programming.",
        "category": "technical",
        "year": 2024,
        "duration_hours": 110,
        "score_display": "88/100",
        "result_display": "Completed vocational training",
        "learning_outcome": "Python strengthened my ability to break problems into smaller steps, organise information, and think in clear logical sequences. It also introduced me to automation and the importance of testing assumptions through structured processes.",
        "academic_connection": "Python is directly connected to my interest in econometrics and applied economics. It can support data cleaning, analysis, reproducibility, and careful work with evidence.",
        "order": 10,
        "featured": True,
    },
    {
        "title": "Web Design Fundamentals — HTML & CSS",
        "issuer": "Iran Technical and Vocational Training Organization",
        "description": "Completed vocational training in web design fundamentals.",
        "category": "technical",
        "year": 2024,
        "duration_hours": 422,
        "score_display": "87/100",
        "result_display": "Completed vocational training",
        "learning_outcome": "This course taught me how structure and presentation work together. HTML and CSS require attention to hierarchy, clarity, accessibility, and consistency. I learned that even visual systems depend on careful organisation.",
        "academic_connection": "The discipline of structuring information is useful far beyond web pages. Clear organisation matters when presenting data, explaining arguments, and making complex ideas understandable.",
        "order": 20,
        "featured": True,
    },
    {
        "title": "Web Development with Django Framework",
        "issuer": "Iran Technical and Vocational Training Organization",
        "description": "Completed vocational training in Django web development.",
        "category": "technical",
        "year": 2024,
        "duration_hours": 120,
        "score_display": "75/100",
        "result_display": "Completed vocational training",
        "learning_outcome": "Django helped me understand how larger systems are organised: models, views, data flow, user input, validation, and administration. It showed me how an idea becomes a functioning application through structured design.",
        "academic_connection": "Building systems with Django strengthened my thinking about data integrity, secure input, and organised workflows. These habits support my long-term interest in evidence-based analysis.",
        "order": 30,
        "featured": True,
    },
    {
        "title": "International Mathematics Without Borders Tournament — 2017",
        "issuer": "International Mathematics Without Borders Tournament",
        "description": "Participated in the International Mathematics Without Borders Tournament.",
        "category": "mathematics",
        "year": 2017,
        "result_display": "Participation",
        "learning_outcome": "Mathematics competitions helped me practise concentration, careful reasoning, and persistence under pressure. They also showed me that difficult questions often require patience before speed.",
        "academic_connection": "This experience supported the quantitative foundation that later became important for my interest in Economics, especially econometrics and analytical reasoning.",
        "order": 40,
    },
    {
        "title": "International Mathematics Without Borders Tournament — 2018",
        "issuer": "International Mathematics Without Borders Tournament",
        "description": "Participated again in the International Mathematics Without Borders Tournament.",
        "category": "mathematics",
        "year": 2018,
        "result_display": "Participation",
        "learning_outcome": "Returning to the tournament gave me another opportunity to practise structured problem-solving and mathematical discipline. It reinforced the importance of consistency rather than relying only on natural ability.",
        "academic_connection": "The experience contributed to my confidence with quantitative subjects and prepared me for fields where logic and evidence matter.",
        "order": 50,
    },
    {
        "title": "Selected Basketball Achievements",
        "issuer": "Institution to be confirmed from certificates",
        "description": "Selected verified basketball placements across several years.",
        "category": "sports",
        "year": 2024,
        "result_display": "Second place in 2017, 2018, and 2023; third place in 2024",
        "learning_outcome": "Basketball taught me teamwork, discipline, resilience, and decision-making under pressure. Repeated participation across several years helped me understand the value of consistent practice and responsibility to a group.",
        "academic_connection": "Economics also requires balancing individual decisions with group outcomes. Team sports helped me think about cooperation, incentives, and performance in structured environments.",
        "order": 60,
    },
    {
        "title": "Volleyball Achievement",
        "issuer": "Institution to be confirmed from certificate",
        "description": "Verified volleyball placement.",
        "category": "sports",
        "year": 2019,
        "result_display": "Second place in 2019",
        "learning_outcome": "Volleyball strengthened my communication, timing, and trust in team coordination. It required focus, adaptability, and awareness of how one action affects the whole team.",
        "academic_connection": "The experience contributed to discipline and group responsibility, qualities that support long-term study and personal growth.",
        "order": 70,
    },
]


BLOG_POSTS = [
    {
        "title": "Economics Helps Me Understand the World; Computing Helps Me Study It",
        "slug": "economics-computing-and-structure",
        "category": "Economics and Technology",
        "excerpt": "Programming and Economics may seem like separate interests, but for me they meet in the same habit: turning curiosity into structure, evidence, and careful questions.",
        "estimated_reading_time": 6,
        "seo_title": "Economics, Computing, and Structure | Atila Hatefi",
        "meta_description": "A personal note on how Economics, mathematics, and programming connect in Atila Hatefi's way of thinking.",
        "key_takeaways": "Programming supports Economics by strengthening precision, structure, and reproducibility.\nTechnical tools should support human judgment, not replace theory or context.\nAtila's direction connects Economics, mathematics, programming, and econometrics.",
        "body": """## A Method For Curiosity
When people see programming on a personal website, they may assume the goal is simply technology. For me, programming has a different role. It is one of the ways I learned to organise questions, test assumptions, and turn a broad idea into something clearer.

Economics interests me because it asks questions that affect real life. Why do prices change? How do incentives influence decisions? Why do policies create different outcomes for different people? How do institutions shape opportunity? These questions are not only theoretical. They appear in businesses, families, cities, and countries.

## Precision And Structure
Programming seems more mechanical at first. A program either runs or it does not. A function receives input and produces output. But this discipline is exactly why programming became important to the way I think. Code forces clarity. If an idea is vague, it cannot be implemented properly. If data is disorganised, the result becomes unreliable.

This way of thinking is useful for Economics. Economic analysis also depends on assumptions, models, data, and interpretation. A model is not reality, just as code is not the whole problem it tries to solve. Both can help us reason more carefully if we understand their limits.

## Toward Econometrics
Python introduced me to logical problem decomposition. A broad question such as why prices changed has to become more precise: which prices, over what period, under what conditions, and with what other changes happening at the same time? Without precision, an answer may sound confident but remain weak.

Django and web development taught me that systems require structure. A website is not only what appears on the screen. Behind it are models, routes, validation, storage, and rules for how information moves. Economic systems are much more complex, but this technical experience helped me appreciate how visible outcomes often depend on hidden structures.

I am especially interested in econometrics because it connects economic questions to evidence. It asks what can be measured, how reliable the measurement is, and whether a conclusion is supported by the data. This is where computing becomes valuable: programming can help clean data, organise it, repeat analysis, and make work more transparent.

## Judgment Still Matters
Technology should not replace economic reasoning. A program can calculate quickly, but it does not decide which question matters. A model can show a relationship, but it cannot automatically explain causation. Artificial intelligence can detect patterns, but it can also reproduce bias or hide uncertainty.

That is why Economics keeps pulling me. Programming gives me a method, but Economics gives that method direction. Mathematics trained my precision. Programming trained my structure. Economics gives me the field where those habits can become meaningful.

I am still at the beginning. I do not claim to be an economist or a researcher. But I know the kind of student I want to become: one who asks careful questions, respects evidence, learns technical tools, and uses them with judgment.""",
        "order": 10,
        "featured": True,
    },
    {
        "title": "Exchange Rates at Street Level: What Growing Up in Tabriz Taught Me About Economics",
        "slug": "exchange-rates-at-street-level-tabriz",
        "category": "Applied Economics",
        "excerpt": "Growing up in a border city made economic change visible through prices, uncertainty, and everyday business decisions. Those observations became questions that formal Economics can answer more carefully.",
        "estimated_reading_time": 7,
        "seo_title": "Exchange Rates at Street Level | Atila Hatefi",
        "meta_description": "A reflective essay on how growing up in Tabriz shaped Atila Hatefi’s interest in exchange rates, markets, evidence, and applied Economics.",
        "key_takeaways": "Growing up in Tabriz made exchange rates and regional trade visible in everyday life.\nPersonal observation can motivate economic questions, but it cannot replace evidence.\nFormal study in Economics and econometrics can turn curiosity into careful analysis.",
        "body": """## A Border City View
Some people first encounter Economics through a textbook. I first encountered it through daily life. I grew up in Tabriz, a city with close trade connections to Türkiye. In a border city, economic change can feel visible. Exchange rates are not only numbers on a screen. They influence conversations, prices, purchasing decisions, inventory choices, and uncertainty.

These observations did not make me an economist. They made me curious. I noticed that exchange-rate movements could affect ordinary businesses. A shop owner might become cautious about replacing inventory. Imported goods might become more expensive. Customers might delay purchases. People might talk about whether prices would rise again.

## Decisions Under Uncertainty
Even without access to formal business data, it was clear that expectations mattered. People were not only reacting to current prices; they were reacting to what they believed might happen next. This is one of the reasons Economics interests me. It studies decisions under constraints. Individuals and businesses rarely make choices with perfect information.

Tabriz also made me aware of regional economic relationships. Türkiye was not a distant idea for me. I visited regularly from early childhood, and Turkish language and culture became familiar through travel and media. The connection between Tabriz and Türkiye made trade, currency, movement, and opportunity feel connected.

## Observation Is Not Proof
I have learned to be careful with personal observation. Observation can create questions, but it cannot prove conclusions by itself. Seeing prices change does not automatically explain why they changed. Hearing business concerns does not show the whole economy. A local experience may be meaningful, but it needs data, comparison, and analysis before it becomes evidence.

This distinction is important to me. I do not want to use personal experience as a substitute for study. I want to use it as the beginning of inquiry. If exchange-rate changes affect businesses, how can we measure the effect? Which sectors are most exposed? How do expectations influence decisions? What is the difference between short-term adjustment and long-term adaptation?

## Why Formal Study Matters
Questions like these require formal Economics. They require theory, data, and methods. They also require humility, because economic outcomes usually have more than one cause. A simple explanation may be attractive, but real economies are complex.

Econometrics offers tools for moving from observation to careful analysis. It helps ask whether a relationship is measurable, whether the data is reliable, and whether a claim is stronger than an assumption. It also teaches caution about causation.

Growing up in Tabriz gave me a street-level awareness of economic change. Mathematics gave me discipline to think quantitatively. Programming gave me a method for structure and testing. Economics is the field where these experiences come together.""",
        "order": 20,
    },
    {
        "title": "Why Econometrics Needs Programming",
        "slug": "why-econometrics-needs-programming",
        "category": "Econometrics",
        "excerpt": "Econometrics connects economic questions with evidence. Programming strengthens that process by helping with data cleaning, reproducibility, automation, and disciplined assumptions.",
        "estimated_reading_time": 7,
        "seo_title": "Why Econometrics Needs Programming | Atila Hatefi",
        "meta_description": "An accessible essay explaining why programming is useful for econometrics, from data cleaning and reproducibility to assumptions and causation.",
        "key_takeaways": "Programming supports econometrics through data cleaning, automation, reproducibility, and visualisation.\nCode can make assumptions visible, but economic theory must guide interpretation.\nProgramming is a tool for better analysis, not a substitute for Economics.",
        "body": """## From Questions To Evidence
Econometrics is often described as the use of statistical methods in Economics. That description is accurate, but it can sound too narrow. To me, econometrics is also a discipline of careful questioning. It asks how an economic idea can be tested with evidence, how reliable that evidence is, and how much confidence a conclusion deserves.

Programming is important because this process is difficult to do well without structure. An economic question usually begins in words: did a policy affect employment, do exchange-rate changes influence prices, or is education connected with income? To test these questions, they must become more precise.

## Data Needs Structure
Data must be collected, cleaned, checked, transformed, and analysed. Each step can introduce errors if it is done carelessly. Larger or repeated analysis needs reproducibility. If another person cannot understand how results were produced, the analysis becomes weaker.

Code can record the process. It can show how missing values were handled, how variables were created, how filters were applied, and how results were generated. This does not make analysis automatically correct, but it makes it easier to review and improve.

Data cleaning is one of the most important examples. Real datasets are rarely perfect. Names may be inconsistent, dates may be formatted differently, some values may be missing, and some entries may be errors. Programming helps because it allows repeated checks instead of hidden manual choices.

## Automation And Visualisation
Econometric work often involves repeating similar steps: importing data, creating variables, running models, generating tables, or producing visualisations. If this is done manually, it becomes slow and error-prone. Programming allows the process to be repeated consistently.

Visualisation is also useful. A graph does not prove a theory, but it can reveal patterns, outliers, and questions. Before running a model, it is often important to simply understand what the data looks like.

## Theory Cannot Be Replaced
Programming cannot replace economic theory. A model may produce a coefficient, but the coefficient does not explain itself. The analyst must understand context, assumptions, and limitations. A technically impressive result can still be misleading if the question is poorly framed.

Correlation and causation show this clearly. Two variables may move together, but that does not prove one causes the other. There may be a third factor, the direction of causality may be unclear, or the data may be biased. Programming can run the model; Economics must guide the interpretation.

For an aspiring Economics student, programming is not about replacing the economist. It is about becoming more disciplined. It supports accuracy, organisation, and reproducibility. It helps handle data, but it does not decide what matters.""",
        "order": 30,
    },
    {
        "title": "Can Artificial Intelligence Improve Economic Decisions Without Replacing Human Judgment?",
        "slug": "ai-economic-decisions-human-judgment",
        "category": "Economics and AI",
        "excerpt": "Artificial intelligence can support forecasting, pattern detection, and data processing, but economic decisions still require institutions, context, incentives, and human responsibility.",
        "estimated_reading_time": 7,
        "seo_title": "AI, Economic Decisions, and Human Judgment | Atila Hatefi",
        "meta_description": "A balanced essay on how artificial intelligence may support economic analysis while still requiring human judgment, institutions, and critical thinking.",
        "key_takeaways": "AI can support economic analysis through forecasting, pattern detection, and data processing.\nAI is not automatically objective; biased data and opaque models can create serious risks.\nHuman judgment, institutions, and economic reasoning remain essential.",
        "body": """## A Tool, Not A Judge
Artificial intelligence is often discussed as if it can make decisions more objective. This idea is attractive, but incomplete. AI can process large amounts of information, detect patterns, and support forecasting. These abilities may be useful in economic analysis. But better processing does not automatically mean better judgment.

Economic decisions are not only technical. They involve incentives, institutions, uncertainty, values, and consequences for people. Because of this, AI should be seen as a tool that can support human judgment, not replace it.

## Possible Benefits
One possible benefit of AI is speed. Economic data can be large and complex. AI systems may help identify patterns faster than a person could manually. They may assist with forecasting, classification, anomaly detection, or summarising information.

Another benefit is consistency. A well-designed system can apply the same procedure repeatedly. This can reduce some forms of human error. For example, an automated tool might help organise documents, check data quality, or flag unusual changes.

AI may also help analysts explore questions. It can support coding, generate first drafts of data workflows, or help compare possible explanations. Used carefully, it can become part of the technical toolkit for students and researchers.

## Risks And Limits
The risks are serious. AI systems depend on data. If the data is biased, incomplete, or poorly measured, the output can also be biased. A model may appear neutral because it is mathematical, but numbers do not guarantee fairness or truth.

Opacity is another problem. Some AI systems are difficult to interpret. If a model recommends a decision but cannot clearly explain why, it becomes hard to evaluate responsibility. In Economics, explanation matters. A forecast may be useful, but decision-makers also need to understand the assumptions and limitations behind it.

Overconfidence is a third risk. People may trust a technical system because it looks advanced. A model can be wrong, miss context, or perform well in one environment and poorly in another.

## Institutions Still Matter
AI systems are built and used by institutions. The purpose of the institution affects how the tool is applied. A model used to reduce risk, increase profit, allocate resources, or evaluate eligibility will reflect goals chosen by people.

This is why human judgment remains essential. Humans must decide which questions matter, which data is appropriate, which errors are acceptable, and how to respond when outcomes affect real people. Institutions must create rules for accountability, and analysts must communicate uncertainty.

For an Economics student, AI is both an opportunity and a warning. The opportunity is technical: learning modern tools can make analysis more powerful. The warning is intellectual: technical power without critical thinking can produce confident mistakes.""",
        "order": 40,
    },
]


def seed_content(apps, schema_editor):
    Certificate = apps.get_model("portfolio", "Certificate")
    BlogPost = apps.get_model("portfolio", "BlogPost")

    for achievement in ACHIEVEMENTS:
        Certificate.objects.update_or_create(
            title=achievement["title"],
            defaults={
                **achievement,
                "is_visible": True,
                "external_url": "",
            },
        )

    published_at = timezone.make_aware(datetime(2026, 6, 18, 12, 0, 0))
    for post in BLOG_POSTS:
        BlogPost.objects.update_or_create(
            slug=post["slug"],
            defaults={
                **post,
                "published_at": published_at,
                "is_published": True,
            },
        )


def remove_seed_content(apps, schema_editor):
    Certificate = apps.get_model("portfolio", "Certificate")
    BlogPost = apps.get_model("portfolio", "BlogPost")

    Certificate.objects.filter(title__in=[item["title"] for item in ACHIEVEMENTS]).delete()
    BlogPost.objects.filter(slug__in=[item["slug"] for item in BLOG_POSTS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("portfolio", "0004_blogpost_certificate_academic_connection_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_content, remove_seed_content),
    ]
