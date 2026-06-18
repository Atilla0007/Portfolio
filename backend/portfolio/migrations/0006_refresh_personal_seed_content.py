from datetime import datetime

from django.db import migrations
from django.utils import timezone


OLD_BLOG_SLUG = "economics-is-my-purpose-computing-is-my-method"

UPDATED_BLOG_POST = {
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
}

UPDATED_CERTIFICATE_CONNECTIONS = {
    "Web Design Fundamentals — HTML & CSS": "The discipline of structuring information is useful far beyond web pages. Clear organisation matters when presenting data, explaining arguments, and making complex ideas understandable.",
    "Volleyball Achievement": "The experience contributed to discipline and group responsibility, qualities that support long-term study and personal growth.",
}


def refresh_personal_seed_content(apps, schema_editor):
    BlogPost = apps.get_model("portfolio", "BlogPost")
    Certificate = apps.get_model("portfolio", "Certificate")

    new_post = BlogPost.objects.filter(slug=UPDATED_BLOG_POST["slug"]).first()
    old_post = BlogPost.objects.filter(slug=OLD_BLOG_SLUG).first()
    post = new_post or old_post

    if post is None:
        post = BlogPost(published_at=timezone.make_aware(datetime(2026, 6, 18, 12, 0, 0)))

    for field, value in UPDATED_BLOG_POST.items():
        setattr(post, field, value)

    post.is_published = True
    post.save()

    if old_post is not None and old_post.pk != post.pk:
        old_post.delete()

    for title, connection in UPDATED_CERTIFICATE_CONNECTIONS.items():
        Certificate.objects.filter(title=title).update(academic_connection=connection)


class Migration(migrations.Migration):

    dependencies = [
        ("portfolio", "0005_seed_admissions_content"),
    ]

    operations = [
        migrations.RunPython(refresh_personal_seed_content, migrations.RunPython.noop),
    ]
