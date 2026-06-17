from io import BytesIO
from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image

from portfolio.serializers import CertificateSerializer

from .models import Certificate
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
                "date",
                "image_url",
                "file_url",
                "external_url",
                "order",
            },
        )


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


class SettingsHelperTests(TestCase):
    def test_env_bool_accepts_true_values(self):
        from portfolio_backend.settings import env_bool

        with patch.dict("os.environ", {"PORTFOLIO_TEST_BOOL": "yes"}):
            self.assertTrue(env_bool("PORTFOLIO_TEST_BOOL", False))

    def test_env_list_removes_empty_values(self):
        from portfolio_backend.settings import env_list

        with patch.dict("os.environ", {"PORTFOLIO_TEST_LIST": "one, two,, "}):
            self.assertEqual(env_list("PORTFOLIO_TEST_LIST"), ["one", "two"])
