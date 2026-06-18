import re

from rest_framework import serializers

from .models import BlogPost, BlogSource, Certificate, ContactTicket


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
        )

    category_display = serializers.CharField(source="get_category_display", read_only=True)

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


class BlogSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogSource
        fields = ("label", "url", "order")


class BlogPostListSerializer(serializers.ModelSerializer):
    sources = BlogSourceSerializer(many=True, read_only=True)
    key_takeaways = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = (
            "id",
            "title",
            "slug",
            "category",
            "excerpt",
            "published_at",
            "estimated_reading_time",
            "seo_title",
            "meta_description",
            "featured",
            "order",
            "key_takeaways",
            "sources",
        )

    def get_key_takeaways(self, obj):
        return _lines(obj.key_takeaways)


class BlogPostDetailSerializer(BlogPostListSerializer):
    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ("body",)


def _lines(value):
    return [line.strip() for line in value.splitlines() if line.strip()]


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
