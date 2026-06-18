from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError
from django.test import TestCase, override_settings
from PIL import Image

from portfolio.serializers import CertificateSerializer

from .models import BlogPost, BlogSource, Certificate
from .validators import MAX_CERTIFICATE_FILE_SIZE


def image_upload(name="certificate.png"):
    image = Image.new("RGB", (1, 1), color="white")
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/png")


class CertificateApiTests(TestCase):
    def test_public_get_access_returns_visible_certificates(self):
        Certificate.objects.create(title="Visible", issuer="Atila", is_visible=True)

        response = self.client.get("/api/certificates/")

        self.assertEqual(response.status_code, 200)
        titles = {item["title"] for item in response.json()}
        self.assertIn("Visible", titles)

    def test_hidden_certificates_are_not_returned(self):
        Certificate.objects.create(title="Visible", issuer="Atila", is_visible=True)
        Certificate.objects.create(title="Hidden", issuer="Atila", is_visible=False)

        response = self.client.get("/api/certificates/")

        self.assertEqual(response.status_code, 200)
        titles = {item["title"] for item in response.json()}
        self.assertIn("Visible", titles)
        self.assertNotIn("Hidden", titles)

    def test_anonymous_writes_are_rejected(self):
        for method in ("post", "put", "patch", "delete"):
            with self.subTest(method=method):
                response = getattr(self.client, method)("/api/certificates/")
                self.assertIn(response.status_code, {401, 403, 405})

    def test_serializer_exposes_only_public_certificate_fields(self):
        certificate = Certificate.objects.create(title="Visible", issuer="Atila")

        data = CertificateSerializer(certificate).data

        self.assertEqual(
            set(data),
            {
                "id",
                "title",
                "issuer",
                "description",
                "category",
                "category_display",
                "date",
                "year",
                "duration_hours",
                "score_display",
                "result_display",
                "learning_outcome",
                "academic_connection",
                "image_url",
                "file_url",
                "external_url",
                "order",
                "featured",
            },
        )

    def test_new_public_achievement_fields_are_serialized(self):
        Certificate.objects.create(
            title="Python Programming",
            issuer="Training Organization",
            category=Certificate.Category.TECHNICAL,
            year=2024,
            duration_hours=110,
            score_display="88/100",
            result_display="Completed vocational training",
            learning_outcome="Learned logical problem decomposition.",
            academic_connection="Supports econometrics preparation.",
            featured=True,
        )

        response = self.client.get("/api/certificates/")

        self.assertEqual(response.status_code, 200)
        item = response.json()[0]
        self.assertEqual(item["category"], "technical")
        self.assertEqual(item["category_display"], "Technical Learning")
        self.assertEqual(item["year"], 2024)
        self.assertEqual(item["duration_hours"], 110)
        self.assertEqual(item["score_display"], "88/100")
        self.assertEqual(item["result_display"], "Completed vocational training")
        self.assertEqual(item["learning_outcome"], "Learned logical problem decomposition.")
        self.assertEqual(item["academic_connection"], "Supports econometrics preparation.")
        self.assertTrue(item["featured"])


class CertificateValidationTests(TestCase):
    def test_invalid_external_url_is_rejected(self):
        certificate = Certificate(title="Bad URL", issuer="Atila", external_url="not-a-url")

        with self.assertRaises(ValidationError):
            certificate.full_clean()

    def test_dangerous_external_url_scheme_is_rejected(self):
        certificate = Certificate(
            title="Bad Scheme",
            issuer="Atila",
            external_url="javascript:alert(1)",
        )

        with self.assertRaises(ValidationError):
            certificate.full_clean()

    def test_oversized_file_is_rejected(self):
        upload = SimpleUploadedFile(
            "large.pdf",
            b"%PDF-" + (b"0" * (MAX_CERTIFICATE_FILE_SIZE + 1)),
            content_type="application/pdf",
        )
        certificate = Certificate(title="Large", issuer="Atila", file=upload)

        with self.assertRaises(ValidationError):
            certificate.full_clean()

    def test_unsupported_file_type_is_rejected(self):
        upload = SimpleUploadedFile(
            "certificate.html",
            b"<html></html>",
            content_type="text/html",
        )
        certificate = Certificate(title="HTML", issuer="Atila", file=upload)

        with self.assertRaises(ValidationError):
            certificate.full_clean()

    def test_valid_image_upload_is_accepted(self):
        certificate = Certificate(title="Image", issuer="Atila", image=image_upload())

        certificate.full_clean()


class BlogApiTests(TestCase):
    def test_only_published_posts_are_listed(self):
        BlogPost.objects.create(
            title="Published",
            slug="published",
            category="Economics",
            excerpt="Published excerpt",
            body="Published body",
            seo_title="Published SEO",
            meta_description="Published meta",
            is_published=True,
        )
        BlogPost.objects.create(
            title="Draft",
            slug="draft",
            category="Economics",
            excerpt="Draft excerpt",
            body="Draft body",
            seo_title="Draft SEO",
            meta_description="Draft meta",
            is_published=False,
        )

        response = self.client.get("/api/blog/")

        self.assertEqual(response.status_code, 200)
        slugs = {item["slug"] for item in response.json()}
        self.assertIn("published", slugs)
        self.assertNotIn("draft", slugs)

    def test_draft_detail_returns_404(self):
        BlogPost.objects.create(
            title="Draft",
            slug="draft",
            category="Economics",
            excerpt="Draft excerpt",
            body="Draft body",
            seo_title="Draft SEO",
            meta_description="Draft meta",
            is_published=False,
        )

        response = self.client.get("/api/blog/draft/")

        self.assertEqual(response.status_code, 404)

    def test_anonymous_blog_writes_are_rejected(self):
        for method in ("post", "put", "patch", "delete"):
            with self.subTest(method=method):
                response = getattr(self.client, method)("/api/blog/")
                self.assertIn(response.status_code, {401, 403, 405})

    def test_duplicate_slugs_are_prevented(self):
        BlogPost.objects.create(
            title="First",
            slug="same-slug",
            category="Economics",
            excerpt="First excerpt",
            body="First body",
            seo_title="First SEO",
            meta_description="First meta",
        )

        with self.assertRaises(IntegrityError):
            BlogPost.objects.create(
                title="Second",
                slug="same-slug",
                category="Economics",
                excerpt="Second excerpt",
                body="Second body",
                seo_title="Second SEO",
                meta_description="Second meta",
            )

    def test_unsafe_source_urls_are_rejected(self):
        post = BlogPost.objects.create(
            title="Post",
            slug="post",
            category="Economics",
            excerpt="Excerpt",
            body="Body",
            seo_title="SEO",
            meta_description="Meta",
        )
        source = BlogSource(post=post, label="Unsafe", url="javascript:alert(1)")

        with self.assertRaises(ValidationError):
            source.full_clean()

    def test_detail_serializes_safe_structured_content(self):
        post = BlogPost.objects.create(
            title="Published",
            slug="published",
            category="Economics",
            excerpt="Published excerpt",
            body="## Heading\nBody paragraph",
            key_takeaways="One\nTwo",
            seo_title="Published SEO",
            meta_description="Published meta",
            is_published=True,
        )
        BlogSource.objects.create(
            post=post,
            label="Source",
            url="https://example.com/source",
        )

        response = self.client.get("/api/blog/published/")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["body"], "## Heading\nBody paragraph")
        self.assertEqual(data["key_takeaways"], ["One", "Two"])
        self.assertEqual(data["sources"][0]["url"], "https://example.com/source")


class HealthCheckTests(TestCase):
    def test_health_check_returns_minimal_ok_response(self):
        response = self.client.get("/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
        self.assertNotContains(response, "SECRET_KEY")
        self.assertNotContains(response, "DATABASE_URL")

    @override_settings(HEALTH_CHECK_DATABASE=True)
    def test_health_check_can_verify_database_connection(self):
        response = self.client.get("/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})


class AdminRouteTests(TestCase):
    def test_admin_uses_settings_url(self):
        response = self.client.get("/go-to-settings/")

        self.assertEqual(response.status_code, 302)
        self.assertIn("/go-to-settings/login/", response["Location"])

    def test_old_admin_url_is_not_mounted(self):
        response = self.client.get("/admin/")

        self.assertEqual(response.status_code, 404)


class FrontendServingTests(TestCase):
    def test_frontend_index_serves_home_and_client_routes(self):
        with TemporaryDirectory() as directory:
            dist_dir = Path(directory)
            (dist_dir / "index.html").write_text("<div id=\"root\">app-shell</div>", encoding="utf-8")

            with override_settings(FRONTEND_DIST_DIR=dist_dir):
                for path in ("/", "/cv", "/why-economics"):
                    with self.subTest(path=path):
                        response = self.client.get(path)

                        self.assertEqual(response.status_code, 200)
                        self.assertEqual(response["Cache-Control"], "no-cache")
                        self.assertIn(b"app-shell", b"".join(response.streaming_content))

    def test_frontend_asset_serves_built_files_with_cache_header(self):
        with TemporaryDirectory() as directory:
            dist_dir = Path(directory)
            assets_dir = dist_dir / "assets"
            assets_dir.mkdir()
            (assets_dir / "index.js").write_text("console.log('portfolio')", encoding="utf-8")

            with override_settings(FRONTEND_DIST_DIR=dist_dir, FRONTEND_ASSET_MAX_AGE=60):
                response = self.client.get("/assets/index.js")

                self.assertEqual(response.status_code, 200)
                self.assertEqual(response["Cache-Control"], "public, max-age=60, immutable")
                self.assertIn(b"portfolio", b"".join(response.streaming_content))

    def test_missing_frontend_build_returns_clear_error(self):
        with TemporaryDirectory() as directory:
            with override_settings(FRONTEND_DIST_DIR=Path(directory)):
                response = self.client.get("/")

        self.assertEqual(response.status_code, 503)
        self.assertContains(response, "Frontend build is missing", status_code=503)

    def test_backend_prefixes_do_not_fall_through_to_frontend(self):
        with TemporaryDirectory() as directory:
            dist_dir = Path(directory)
            (dist_dir / "index.html").write_text("<div id=\"root\">app-shell</div>", encoding="utf-8")

            with override_settings(FRONTEND_DIST_DIR=dist_dir):
                response = self.client.get("/api/not-real/")

        self.assertEqual(response.status_code, 404)


class SettingsHelperTests(TestCase):
    def test_env_bool_accepts_true_values(self):
        from portfolio_backend.settings import env_bool

        with patch.dict("os.environ", {"PORTFOLIO_TEST_BOOL": "yes"}):
            self.assertTrue(env_bool("PORTFOLIO_TEST_BOOL", False))

    def test_env_list_removes_empty_values(self):
        from portfolio_backend.settings import env_list

        with patch.dict("os.environ", {"PORTFOLIO_TEST_LIST": "one, two,, "}):
            self.assertEqual(env_list("PORTFOLIO_TEST_LIST"), ["one", "two"])

    def test_project_domain_is_allowed_by_default(self):
        from django.conf import settings

        self.assertIn("atilahatefi.ir", settings.ALLOWED_HOSTS)
        self.assertIn(".atilahatefi.ir", settings.ALLOWED_HOSTS)
