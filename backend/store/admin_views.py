"""
Admin panel API views (separate auth: username/password).
"""
import json
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from .models import AdminUser, Product, Category, Order, User
from .serializers import (
    ProductListSerializer, ProductDetailSerializer,
    OrderSerializer, CategorySerializer, UserSerializer
)
from .admin_auth import admin_jwt_required, get_admin_from_token


def _authenticate_admin(username, password):
    try:
        admin = AdminUser.objects.get(username=username)
        if check_password(password, admin.password):
            return admin
    except AdminUser.DoesNotExist:
        pass
    return None


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Admin login: returns a simple token (username-based) for demo. In production use JWT."""
    data = request.data
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    admin = _authenticate_admin(username, password)
    if not admin:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    # Simple token: base64(username:timestamp) for demo. Frontend stores and sends in header.
    import base64
    token = base64.b64encode(f"{admin.username}:{timezone.now().isoformat()}".encode()).decode()
    return Response({
        'token': token,
        'username': admin.username,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_dashboard(request):
    """Dashboard stats: total orders, recent orders, etc."""
    total_orders = Order.objects.count()
    total_revenue = Order.objects.exclude(status='cancelled').aggregate(Sum('total'))['total__sum'] or 0
    pending_orders = Order.objects.filter(status='pending').count()
    last_30_days = timezone.now() - timedelta(days=30)
    orders_30 = Order.objects.filter(created_at__gte=last_30_days).count()
    recent_orders = Order.objects.select_related('user').order_by('-created_at')[:10]
    return Response({
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'pending_orders': pending_orders,
        'orders_last_30_days': orders_30,
        'recent_orders': OrderSerializer(recent_orders, many=True).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_orders_list(request):
    """
    List orders with optional status filter and aggregated stats.

    Query param:
      - status: one of [all, pending, sent, complete, return]
        * pending  -> Order.status == 'pending'
        * sent     -> Order.status == 'shipped'
        * complete -> Order.status == 'delivered'
        * return   -> Order.status == 'cancelled'
        * all (default) -> no filter
    """
    status_key = request.query_params.get('status') or request.GET.get('status') or 'all'

    base_qs = Order.objects.select_related('user').order_by('-created_at')
    orders = base_qs

    if status_key == 'pending':
        orders = base_qs.filter(status='pending')
    elif status_key == 'sent':
        orders = base_qs.filter(status='shipped')
    elif status_key == 'complete':
        orders = base_qs.filter(status='delivered')
    elif status_key == 'return':
        orders = base_qs.filter(status='cancelled')
    # 'all' -> no extra filter

    serializer = OrderSerializer(orders, many=True)

    # Stats across all orders (not just filtered)
    all_qs = Order.objects.all()
    stats = {
        'all': all_qs.count(),
        'pending': all_qs.filter(status='pending').count(),
        'sent': all_qs.filter(status='shipped').count(),
        'complete': all_qs.filter(status='delivered').count(),
        'return': all_qs.filter(status='cancelled').count(),
    }
    return Response({
        'orders': serializer.data,
        'stats': stats,
    })


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_order_detail(request, pk):
    """Get single order or update order status."""
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(OrderSerializer(order).data)
    if request.method in ('PUT', 'PATCH'):
        new_status = request.data.get('status')
        allowed = {'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'}
        if new_status not in allowed:
            return Response({'error': f'Invalid status. Use one of: {", ".join(sorted(allowed))}'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save(update_fields=['status'])
        return Response(OrderSerializer(order).data)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_products_list(request):
    """List products or create product. POST accepts JSON or multipart/form-data with image files."""
    if request.method == 'GET':
        products = Product.objects.select_related('category', 'main_image').prefetch_related('images').order_by('-created_at')
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    # POST create
    from .serializers import ProductDetailSerializer
    from .models import ProductImage
    if request.content_type and 'multipart' in request.content_type:
        data = request.POST.dict() if request.POST else {}
        files = request.FILES.getlist('images') or request.FILES.getlist('image') or []
    else:
        data = request.data.copy() if hasattr(request, 'data') else {}
        data = dict(data)
        files = []
    category_id = data.get('category')
    if not category_id:
        return Response({'category': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        cat = Category.objects.get(pk=category_id)
    except Category.DoesNotExist:
        return Response({'category': 'Invalid category.'}, status=status.HTTP_400_BAD_REQUEST)
    slug = data.get('slug') or (data.get('name') or '').lower().replace(' ', '-')
    if Product.objects.filter(slug=slug).exists():
        slug = f"{slug}-{Product.objects.count()}"
    is_featured = data.get('is_featured')
    if isinstance(is_featured, str):
        is_featured = is_featured.lower() in ('true', '1', 'yes')
    try:
        price = float(data.get('price', 0) or 0)
    except (TypeError, ValueError):
        price = 0
    try:
        stock = int(data.get('stock', 0) or 0)
    except (TypeError, ValueError):
        stock = 0

    # Enforce 1–5 images for each product
    if not files:
        return Response({'images': 'At least one image is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(files) > 5:
        return Response({'images': 'You can upload up to 5 images per product.'}, status=status.HTTP_400_BAD_REQUEST)
    product = Product.objects.create(
        name=data.get('name', ''),
        slug=slug,
        description=data.get('description', ''),
        price=price,
        category=cat,
        stock=stock,
        is_featured=bool(is_featured),
    )
    first_img = None
    for i, f in enumerate(files):
        img = ProductImage.objects.create(product=product, image=f, order=i)
        if i == 0:
            first_img = img
    if first_img:
        product.main_image = first_img
        product.save(update_fields=['main_image'])
    return Response(ProductDetailSerializer(product, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_product_detail(request, pk):
    """Get, update, or delete product."""
    from .models import ProductImage
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        return Response(ProductDetailSerializer(product, context={'request': request}).data)
    if request.method == 'PUT':
        if request.content_type and 'multipart' in request.content_type:
            data = request.POST.dict() if request.POST else {}
            files = request.FILES.getlist('images') or request.FILES.getlist('image') or []
        else:
            data = request.data or {}
            files = []
        for field in ['name', 'slug', 'description', 'price', 'stock']:
            if field in data:
                setattr(product, field, data[field])
        if 'is_featured' in data:
            product.is_featured = str(data['is_featured']).lower() in ('true', '1', 'yes')
        if 'category' in data:
            product.category_id = data['category']
        product.save()

        # If images are included in a PUT, treat them as additional images (still honoring max 5)
        if files:
            existing_count = product.images.count()
            if existing_count >= 5:
                return Response({'images': 'Maximum of 5 images per product.'}, status=status.HTTP_400_BAD_REQUEST)
            if existing_count + len(files) > 5:
                return Response({'images': f'You can upload up to {5 - existing_count} more images.'}, status=status.HTTP_400_BAD_REQUEST)
            next_order = existing_count
            for i, f in enumerate(files):
                ProductImage.objects.create(product=product, image=f, order=next_order + i)
        return Response(ProductDetailSerializer(product, context={'request': request}).data)
    if request.method == 'DELETE':
        # Delete associated image files from storage before deleting the product
        for img in product.images.all():
            if img.image:
                img.image.delete(save=False)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_product_images(request, pk):
    """Add images to an existing product. Expects multipart/form-data with 'images' or 'image' file(s)."""
    from .models import ProductImage
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    files = list(request.FILES.getlist('images') or request.FILES.getlist('image') or [])
    if not files:
        return Response({'error': 'No image files provided'}, status=status.HTTP_400_BAD_REQUEST)

    existing_count = product.images.count()
    if existing_count >= 5:
        return Response({'error': 'Maximum of 5 images per product.'}, status=status.HTTP_400_BAD_REQUEST)
    if existing_count + len(files) > 5:
        return Response({'error': f'You can upload up to {5 - existing_count} more images.'}, status=status.HTTP_400_BAD_REQUEST)

    start = existing_count
    first_new = None
    for i, f in enumerate(files):
        img = ProductImage.objects.create(product=product, image=f, order=start + i)
        if i == 0:
            first_new = img
    if not product.main_image_id and first_new:
        product.main_image = first_new
        product.save(update_fields=['main_image'])
    from .serializers import ProductDetailSerializer
    return Response(ProductDetailSerializer(product, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_product_image_delete(request, pk, image_pk):
    """Remove an image from a product. Reassigns main_image if the deleted image was main."""
    from .models import ProductImage
    try:
        img = ProductImage.objects.get(pk=image_pk, product_id=pk)
    except ProductImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
    product = img.product
    if product.main_image_id == img.pk:
        next_main = product.images.exclude(pk=img.pk).order_by('order').first()
        product.main_image = next_main
        product.save(update_fields=['main_image'])
    if img.image:
        img.image.delete(save=False)
    img.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_categories_list(request):
    """List or create categories."""
    if request.method == 'GET':
        categories = Category.objects.all().order_by('name')
        return Response(CategorySerializer(categories, many=True, context={'request': request}).data)
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_category_detail(request, pk):
    """Update or delete category."""
    try:
        cat = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'PUT':
        serializer = CategorySerializer(cat, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    cat.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([AllowAny])
@admin_jwt_required
def admin_users_list(request):
    """List users (customers)."""
    users = User.objects.all().order_by('-date_joined')
    return Response(UserSerializer(users, many=True).data)
