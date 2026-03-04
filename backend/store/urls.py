"""
Store API URL routes.
"""
from django.urls import path
from . import views
from . import admin_views

urlpatterns = [
    # Auth
    path('auth/signup/', views.signup),
    path('auth/login/', views.login),
    path('auth/me/', views.me),
    # Products
    path('products/', views.ProductListAPI.as_view()),
    path('products/featured/', views.featured_products),
    path('products/<int:id>/', views.ProductDetailAPI.as_view()),
    path('products/<int:product_id>/reviews/', views.add_review),
    path('categories/', views.categories_list),
    # Cart
    path('cart/', views.cart_detail),
    path('cart/add/', views.cart_add),
    path('cart/update/', views.cart_update),
    path('cart/remove/', views.cart_remove),
    # Orders
    path('orders/', views.my_orders),
    path('orders/create/', views.create_order),
    # Admin (separate auth)
    path('admin/login/', admin_views.admin_login),
    path('admin/dashboard/', admin_views.admin_dashboard),
    path('admin/orders/', admin_views.admin_orders_list),
    path('admin/orders/<int:pk>/', admin_views.admin_order_detail),
    path('admin/products/', admin_views.admin_products_list),
    path('admin/products/<int:pk>/', admin_views.admin_product_detail),
    path('admin/products/<int:pk>/images/', admin_views.admin_product_images),
    path('admin/products/<int:pk>/images/<int:image_pk>/', admin_views.admin_product_image_delete),
    path('admin/categories/', admin_views.admin_categories_list),
    path('admin/categories/<int:pk>/', admin_views.admin_category_detail),
    path('admin/users/', admin_views.admin_users_list),
]
