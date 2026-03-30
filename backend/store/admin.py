from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.urls import reverse
from django.utils.html import mark_safe
from django.contrib.admin import DateFieldListFilter

from .models import (
    User,
    AdminUser,
    Category,
    Product,
    ProductImage,
    Review,
    Cart,
    CartItem,
    Order,
    OrderItem,
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin config for custom User model."""

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Additional info",
            {
                "fields": (
                    "phone",
                    "address",
                    "city",
                    "postal_code",
                )
            },
        ),
    )
    list_display = ("email", "username", "first_name", "last_name", "is_staff")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("email",)


@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ("username", "created_at")
    search_fields = ("username",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    """Allow adding multiple images directly on the product admin page."""

    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "order", "preview")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj and obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="height: 80px; border-radius: 8px;" />')
        return "-"

    preview.short_description = "Preview"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "compare_at_price", "is_on_sale", "stock", "is_featured", "created_at")
    list_filter = ("category", "is_on_sale", "is_featured")
    search_fields = ("name", "slug", "description")
    inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "order")
    list_filter = ("product",)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("product__name", "user__email")


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at", "updated_at")
    search_fields = ("user__email",)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("cart", "product", "quantity")
    list_filter = ("product",)


class OrderItemInline(admin.TabularInline):
    """Show order items with product image and link inside the order admin."""

    model = OrderItem
    extra = 0
    fields = ("product_link", "product_image", "quantity", "price", "subtotal")
    readonly_fields = ("product_link", "product_image", "subtotal")

    def product_link(self, obj):
        if not obj.product_id:
            return "-"
        url = reverse("admin:store_product_change", args=[obj.product_id])
        return mark_safe(f'<a href="{url}">{obj.product.name}</a>')

    product_link.short_description = "Product"

    def product_image(self, obj):
        product = obj.product
        if not product:
            return "-"
        img = getattr(product, "main_image", None) or product.images.first()
        if img and img.image:
            return mark_safe(f'<img src="{img.image.url}" style="height: 80px; border-radius: 8px;" />')
        return "-"

    product_image.short_description = "Image"

    def subtotal(self, obj):
        if not obj or obj.price is None or obj.quantity is None:
            return "-"
        return obj.subtotal

    subtotal.short_description = "Subtotal"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "user", "status", "total", "created_at")
    list_filter = ("status", ("created_at", DateFieldListFilter))
    date_hierarchy = "created_at"
    search_fields = ("order_number", "user__email", "shipping_name")
    inlines = [OrderItemInline]
    actions = ("mark_pending", "mark_sent", "mark_complete", "mark_cancelled")

    @admin.action(description="Mark selected orders as Pending")
    def mark_pending(self, request, queryset):
        queryset.update(status="pending")

    @admin.action(description="Mark selected orders as Sent (Shipped)")
    def mark_sent(self, request, queryset):
        queryset.update(status="shipped")

    @admin.action(description="Mark selected orders as Complete (Delivered)")
    def mark_complete(self, request, queryset):
        queryset.update(status="delivered")

    @admin.action(description="Mark selected orders as Cancelled")
    def mark_cancelled(self, request, queryset):
        queryset.update(status="cancelled")


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product", "quantity", "price")
    list_filter = ("product",)


