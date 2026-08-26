from rest_framework import serializers
from core.models import (
    Product,
    ProductImage,
    ProductVariant,
    HeroSlide,
    GalleryPhoto,
    Look,
    StoreSetting,
    DeliveryZone,
    Order,
    OrderItem,
    Customer,
    Lead,
    Communication,
)


class ProductImageSerializer(serializers.ModelSerializer):
    display_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ["id", "image", "image_url", "is_cover", "order", "display_url"]

    def get_display_url(self, obj):
        return obj.get_display_url()


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ["id", "size", "stock"]


class ProductListSerializer(serializers.ModelSerializer):
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "price",
            "old_price",
            "category",
            "is_active",
            "cover_url",
            "created_at",
        ]

    def get_cover_url(self, obj):
        cover = obj.images.filter(is_cover=True).first()
        if cover:
            return cover.get_display_url()
        first = obj.images.first()
        if first:
            return first.get_display_url()
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "price",
            "old_price",
            "category",
            "is_active",
            "cover_url",
            "images",
            "variants",
            "created_at",
            "updated_at",
        ]

    def get_cover_url(self, obj):
        cover = obj.images.filter(is_cover=True).first()
        if cover:
            return cover.get_display_url()
        first = obj.images.first()
        if first:
            return first.get_display_url()
        return None


class HeroSlideSerializer(serializers.ModelSerializer):
    image_url_resolved = serializers.SerializerMethodField()

    class Meta:
        model = HeroSlide
        fields = [
            "id",
            "title",
            "subtitle",
            "subtitle_class",
            "description",
            "cta_text",
            "cta_link",
            "badge",
            "piece_text",
            "image",
            "image_url",
            "image_url_resolved",
            "order",
            "is_active",
        ]

    def get_image_url_resolved(self, obj):
        return obj.get_image_url()


class GalleryPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryPhoto
        fields = [
            "id",
            "title",
            "image",
            "description",
            "tags",
            "photo_type",
            "is_active",
            "order",
        ]


class LookSerializer(serializers.ModelSerializer):
    image_url_resolved = serializers.SerializerMethodField()

    class Meta:
        model = Look
        fields = [
            "id",
            "tag",
            "title",
            "description",
            "image",
            "image_url",
            "image_url_resolved",
            "order",
        ]

    def get_image_url_resolved(self, obj):
        return obj.get_image_url()


class StoreSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSetting
        fields = [
            "id",
            "whatsapp_number",
            "pix_key",
            "pix_key_type",
            "pix_name",
            "free_delivery_enabled",
            "pickup_enabled",
        ]


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ["id", "location", "fee", "is_active"]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product_name", "size", "quantity", "price"]


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "customer_phone",
            "delivery_type",
            "delivery_fee",
            "total_amount",
            "status",
            "notes",
            "items",
            "created_at",
        ]
        read_only_fields = ["order_number", "status", "created_at"]


class OrderListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer_name",
            "customer_phone",
            "delivery_type",
            "delivery_fee",
            "total_amount",
            "status",
            "items_count",
            "created_at",
        ]

    def get_items_count(self, obj):
        return obj.items.count()


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "cpf",
            "address",
            "city",
            "notes",
            "tags",
            "total_orders",
            "total_spent",
            "last_order_at",
            "created_at",
        ]
        read_only_fields = [
            "total_orders",
            "total_spent",
            "last_order_at",
            "created_at",
        ]


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            "id",
            "customer",
            "name",
            "phone",
            "email",
            "source",
            "stage",
            "value",
            "notes",
            "created_at",
            "updated_at",
            "closed_at",
        ]
        read_only_fields = ["created_at", "updated_at", "closed_at"]


class CommunicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Communication
        fields = [
            "id",
            "customer",
            "lead",
            "order",
            "type",
            "direction",
            "subject",
            "notes",
            "created_at",
        ]
        read_only_fields = ["created_at"]
