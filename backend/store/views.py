"""
Store API views: Auth, Products, Cart, Orders.
"""
import uuid
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import status, generics
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .serializers import (
    UserSerializer, UserSignupSerializer,
    ProductListSerializer, ProductDetailSerializer, ReviewSerializer,
    CartSerializer, CartItemSerializer,
    OrderSerializer, CreateOrderSerializer,
)
from .email_service import send_order_confirmation_email, send_admin_order_notification

User = get_user_model()


# ----- Auth -----
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserSignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.check_password(password):
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'user': UserSerializer(user).data,
        'token': token.key,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# ----- Products -----
class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 48


class ProductListAPI(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    def get_queryset(self):
        qs = Product.objects.select_related('category', 'main_image').prefetch_related('images').order_by('-created_at')
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category_id=category)
        min_price = self.request.query_params.get('min_price')
        if min_price is not None:
            try:
                qs = qs.filter(price__gte=float(min_price))
            except ValueError:
                pass
        max_price = self.request.query_params.get('max_price')
        if max_price is not None:
            try:
                qs = qs.filter(price__lte=float(max_price))
            except ValueError:
                pass
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search)
        sort = self.request.query_params.get('sort')
        if sort == 'price_asc':
            qs = qs.order_by('price')
        elif sort == 'price_desc':
            qs = qs.order_by('-price')
        elif sort == 'newest':
            qs = qs.order_by('-created_at')
        return qs


class ProductDetailAPI(generics.RetrieveAPIView):
    queryset = Product.objects.select_related('category', 'main_image').prefetch_related('images', 'reviews__user')
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'id'


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    products = Product.objects.filter(is_featured=True).select_related('category', 'main_image').prefetch_related('images')[:8]
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def categories_list(request):
    from .serializers import CategorySerializer
    cats = Category.objects.all().order_by('name')
    return Response(CategorySerializer(cats, many=True, context={'request': request}).data)


# ----- Reviews -----
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    data = request.data.copy()
    data['product'] = product.id
    data['user'] = request.user.id
    serializer = ReviewSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----- Cart -----
def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_detail(request):
    cart = get_or_create_cart(request.user)
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_add(request):
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    if not product_id:
        return Response({'error': 'product_id required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        product = Product.objects.get(pk=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    if product.stock < quantity:
        return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
    cart = get_or_create_cart(request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': quantity})
    if not created:
        item.quantity = min(item.quantity + quantity, product.stock)
        item.save()
    serializer = CartSerializer(cart, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_update(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')
    if item_id is None or quantity is None:
        return Response({'error': 'item_id and quantity required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        item = CartItem.objects.get(pk=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
    if quantity < 1:
        item.delete()
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart, context={'request': request}).data)
    if quantity > item.product.stock:
        return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
    item.quantity = quantity
    item.save()
    cart = get_or_create_cart(request.user)
    return Response(CartSerializer(cart, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_remove(request):
    item_id = request.data.get('item_id')
    if not item_id:
        return Response({'error': 'item_id required'}, status=status.HTTP_400_BAD_REQUEST)
    deleted, _ = CartItem.objects.filter(pk=item_id, cart__user=request.user).delete()
    if not deleted:
        return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
    cart = get_or_create_cart(request.user)
    return Response(CartSerializer(cart, context={'request': request}).data)


# ----- Orders -----
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items').order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    cart = get_or_create_cart(request.user)
    if not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    serializer = CreateOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = serializer.validated_data
    with transaction.atomic():
        order_number = f"BJ-{uuid.uuid4().hex[:8].upper()}"
        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            shipping_name=data['shipping_name'],
            shipping_email=data['shipping_email'],
            shipping_phone=data['shipping_phone'],
            shipping_address=data['shipping_address'],
            shipping_city=data['shipping_city'],
            shipping_postal_code=data['shipping_postal_code'],
            notes=data.get('notes', ''),
            total=0,
        )
        total = 0
        for cart_item in cart.items.select_related('product').all():
            if cart_item.product.stock < cart_item.quantity:
                raise ValidationError(
                    {'error': f'Insufficient stock for {cart_item.product.name}'}
                )
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
            )
            total += cart_item.product.price * cart_item.quantity
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()
        order.total = total
        order.save()
        cart.items.all().delete()
    # Emails
    try:
        send_order_confirmation_email(order)
        send_admin_order_notification(order)
    except Exception as e:
        pass  # Log but don't fail order
    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
