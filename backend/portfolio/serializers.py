import re

from rest_framework import serializers

from .models import Certificate, ContactTicket


class CertificateSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = (
            "id",
            "title",
            "issuer",
            "description",
            "date",
            "image_url",
            "file_url",
            "external_url",
            "order",
        )

    def get_image_url(self, obj):
        return self._absolute_media_url(obj.image)

    def get_file_url(self, obj):
        return self._absolute_media_url(obj.file)

    def _absolute_media_url(self, field):
        if not field:
            return ""

        request = self.context.get("request")
        url = field.url
        if request:
            return request.build_absolute_uri(url)
        return url


CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


class ContactTicketSerializer(serializers.ModelSerializer):
    website = serializers.CharField(
        allow_blank=True,
        required=False,
        write_only=True,
        max_length=120,
    )

    class Meta:
        model = ContactTicket
        fields = ("id", "name", "email", "subject", "message", "website", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Invalid submission.")
        return value

    def validate(self, attrs):
        for field_name in ("name", "email", "subject", "message"):
            value = attrs.get(field_name, "")
            value = " ".join(value.split()) if field_name != "message" else value.strip()
            if CONTROL_CHAR_RE.search(value):
                raise serializers.ValidationError({field_name: "Invalid characters."})
            attrs[field_name] = value

        if len(attrs.get("message", "")) < 20:
            raise serializers.ValidationError(
                {"message": "Please write at least 20 characters."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("website", None)
        return super().create(validated_data)
