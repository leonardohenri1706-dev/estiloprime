from django.contrib import admin
from .models import (
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


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ["image", "image_url", "is_cover", "order"]


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ["size", "stock"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "price",
        "old_price",
        "is_active",
        "created_at",
    ]
    list_filter = ["category", "is_active", "created_at"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline, ProductVariantInline]
    list_editable = ["is_active"]


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ["title", "subtitle", "order", "is_active"]
    list_filter = ["is_active"]
    list_editable = ["order", "is_active"]

    @admin.action(description="Reordenar slides selecionados")
    def reorder_slides(self, request, queryset):
        for idx, slide in enumerate(queryset.order_by("order")):
            slide.order = idx
            slide.save()


@admin.register(GalleryPhoto)
class GalleryPhotoAdmin(admin.ModelAdmin):
    list_display = ["title", "photo_type", "order", "is_active"]
    list_filter = ["photo_type", "is_active"]
    list_editable = ["order", "is_active"]
    search_fields = ["title", "tags"]


@admin.register(Look)
class LookAdmin(admin.ModelAdmin):
    list_display = ["tag", "title", "order"]
    list_editable = ["order"]
    search_fields = ["title", "tag"]


@admin.register(StoreSetting)
class StoreSettingAdmin(admin.ModelAdmin):
    list_display = [
        "whatsapp_number",
        "free_delivery_enabled",
        "pickup_enabled",
    ]

    def has_add_permission(self, request):
        if StoreSetting.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ["location", "fee", "is_active"]
    list_editable = ["fee", "is_active"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product_name", "size", "quantity", "price"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "customer_name",
        "total_amount",
        "status",
        "created_at",
    ]
    list_filter = ["status", "delivery_type", "created_at"]
    search_fields = ["customer_name", "customer_phone", "order_number"]
    list_editable = ["status"]
    inlines = [OrderItemInline]


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "phone",
        "total_orders",
        "total_spent",
        "last_order_at",
    ]
    search_fields = ["name", "phone", "email", "cpf"]
    list_filter = ["city", "created_at"]
    readonly_fields = ["total_orders", "total_spent", "last_order_at"]


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "phone",
        "source",
        "stage",
        "value",
        "created_at",
    ]
    list_filter = ["stage", "source"]
    search_fields = ["name", "phone", "email"]
    list_editable = ["stage"]


@admin.register(Communication)
class CommunicationAdmin(admin.ModelAdmin):
    list_display = ["type", "direction", "subject", "created_at"]
    list_filter = ["type", "direction"]
    search_fields = ["subject", "notes"]
