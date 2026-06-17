from pathlib import PurePosixPath
from urllib.parse import urlsplit

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from PIL import Image, UnidentifiedImageError


MAX_CERTIFICATE_IMAGE_SIZE = 5 * 1024 * 1024
MAX_CERTIFICATE_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_CERTIFICATE_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CERTIFICATE_FILE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf",
}
HTTP_URL_VALIDATOR = URLValidator(schemes=("http", "https"))


def validate_http_url(value):
    if not value:
        return

    HTTP_URL_VALIDATOR(value)
    if urlsplit(value).scheme not in {"http", "https"}:
        raise ValidationError("Only HTTP and HTTPS URLs are allowed.")


def validate_certificate_image_upload(value):
    validate_certificate_image_size(value)
    _validate_upload_name(value, ALLOWED_CERTIFICATE_IMAGE_EXTENSIONS)
    _validate_image_content(value)


def validate_certificate_file_upload(value):
    validate_certificate_file_size(value)
    extension = _validate_upload_name(value, ALLOWED_CERTIFICATE_FILE_EXTENSIONS)
    if extension == ".pdf":
        _validate_pdf_content(value)
    else:
        _validate_image_content(value)


def validate_certificate_image_size(value):
    _validate_file_size(value, MAX_CERTIFICATE_IMAGE_SIZE)


def validate_certificate_file_size(value):
    _validate_file_size(value, MAX_CERTIFICATE_FILE_SIZE)


def _validate_file_size(value, max_size):
    size = getattr(value, "size", 0) or 0
    if size > max_size:
        raise ValidationError(f"File must be {max_size // (1024 * 1024)} MB or smaller.")


def _validate_upload_name(value, allowed_extensions):
    name = (getattr(value, "name", "") or "").replace("\\", "/")
    parts = PurePosixPath(name).parts
    if not name or name.startswith("/") or ".." in parts:
        raise ValidationError("Invalid upload filename.")

    extension = PurePosixPath(name).suffix.lower()
    if extension not in allowed_extensions:
        allowed = ", ".join(sorted(allowed_extensions))
        raise ValidationError(f"Unsupported file type. Allowed extensions: {allowed}.")
    return extension


def _validate_image_content(value):
    position = _tell(value)
    try:
        value.seek(0)
        with Image.open(value) as image:
            image.verify()
    except (OSError, UnidentifiedImageError, ValueError) as exc:
        raise ValidationError("Upload must be a valid image file.") from exc
    finally:
        _seek(value, position)


def _validate_pdf_content(value):
    position = _tell(value)
    try:
        value.seek(0)
        if value.read(5) != b"%PDF-":
            raise ValidationError("Upload must be a valid PDF file.")
    finally:
        _seek(value, position)


def _tell(value):
    try:
        return value.tell()
    except (AttributeError, OSError):
        return None


def _seek(value, position):
    try:
        value.seek(0 if position is None else position)
    except (AttributeError, OSError):
        return
