"""
Seed database with sample bridal jewelry data.
Run: python manage.py seed_data

Creates categories, products, placeholder product images (JPEG via Pillow),
and an admin panel user (admin / admin123).
"""
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from PIL import Image, ImageDraw
from store.models import Category, Product, ProductImage, AdminUser

User = get_user_model()


def _placeholder_jpeg(slug: str, rgb: tuple[int, int, int]) -> ContentFile:
    """3:4 JPEG for ProductImage (no external assets required)."""
    w, h = 720, 960
    bg = (250, 248, 243)
    img = Image.new('RGB', (w, h), color=bg)
    draw = ImageDraw.Draw(img)
    margin = 48
    draw.rounded_rectangle(
        [margin, margin, w - margin, h - margin],
        radius=32,
        outline=rgb,
        width=10,
    )
    inner = margin + 72
    fill_rgb = tuple(min(255, int(bg[i] * 0.72 + rgb[i] * 0.28)) for i in range(3))
    draw.rounded_rectangle(
        [inner, inner, w - inner, h - inner],
        radius=22,
        fill=fill_rgb,
    )
    buf = BytesIO()
    img.save(buf, format='JPEG', quality=88)
    buf.seek(0)
    return ContentFile(buf.read(), name=f'seed-{slug}.jpg')


def _ensure_product_images(product: Product, rgb: tuple[int, int, int], stdout) -> None:
    if product.images.exists():
        if not product.main_image_id:
            first = product.images.order_by('order', 'id').first()
            product.main_image = first
            product.save(update_fields=['main_image'])
        return
    cf = _placeholder_jpeg(product.slug, rgb)
    img = ProductImage.objects.create(
        product=product,
        image=cf,
        alt_text=product.name,
        order=0,
    )
    product.main_image = img
    product.save(update_fields=['main_image'])
    stdout.write(f'  Added placeholder image for: {product.name}')


class Command(BaseCommand):
    help = 'Seed database with sample products and admin user'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # Admin user for admin panel (username: admin, password: admin123)
        if not AdminUser.objects.filter(username='admin').exists():
            AdminUser.objects.create(
                username='admin',
                password=make_password('admin123'),
            )
            self.stdout.write(self.style.SUCCESS('Created admin user: admin / admin123'))

        # Demo storefront customer (optional)
        if not User.objects.filter(email='demo@example.com').exists():
            User.objects.create_user(
                username='demoshopper',
                email='demo@example.com',
                password='demo12345',
            )
            self.stdout.write(self.style.SUCCESS('Created demo customer: demo@example.com / demo12345'))

        # Categories
        categories_data = [
            {'name': 'Necklaces', 'slug': 'necklaces', 'description': 'Elegant bridal necklaces'},
            {'name': 'Earrings', 'slug': 'earrings', 'description': 'Bridal earrings and studs'},
            {'name': 'Bracelets', 'slug': 'bracelets', 'description': 'Bridal bracelets'},
            {'name': 'Rings', 'slug': 'rings', 'description': 'Bridal rings and bands'},
            {'name': 'Hair Accessories', 'slug': 'hair-accessories', 'description': 'Tiaras and hair pins'},
        ]
        created_cats = {}
        for c in categories_data:
            cat, _ = Category.objects.get_or_create(slug=c['slug'], defaults=c)
            created_cats[c['slug']] = cat

        # Sample products + accent RGB for placeholder JPEGs
        products_data = [
            {
                'name': 'Pearl Cascade Necklace',
                'slug': 'pearl-cascade-necklace',
                'description': 'Stunning multi-strand pearl necklace with sterling silver clasp. Perfect for your wedding day.',
                'price': 189.99,
                'category': 'necklaces',
                'stock': 15,
                'is_featured': True,
                'accent': (184, 134, 11),
                'is_on_sale': True,
                'compare_at_price': 229.99,
            },
            {
                'name': 'Crystal Drop Earrings',
                'slug': 'crystal-drop-earrings',
                'description': 'Elegant crystal drop earrings with gold plating. Lightweight and comfortable for all-day wear.',
                'price': 79.99,
                'category': 'earrings',
                'stock': 25,
                'is_featured': True,
                'accent': (212, 175, 55),
            },
            {
                'name': 'Diamond Tennis Bracelet',
                'slug': 'diamond-tennis-bracelet',
                'description': 'Classic tennis bracelet with cubic zirconia stones set in rhodium-plated silver.',
                'price': 249.99,
                'category': 'bracelets',
                'stock': 10,
                'is_featured': True,
                'accent': (192, 192, 200),
                'is_on_sale': True,
                'compare_at_price': 299.99,
            },
            {
                'name': 'Vintage Rose Gold Ring',
                'slug': 'vintage-rose-gold-ring',
                'description': 'Vintage-inspired rose gold band with delicate filigree design.',
                'price': 129.99,
                'category': 'rings',
                'stock': 20,
                'is_featured': False,
                'accent': (183, 110, 121),
            },
            {
                'name': 'Bridal Tiara',
                'slug': 'bridal-tiara',
                'description': 'Sparkling bridal tiara with crystal accents. Adjustable for a perfect fit.',
                'price': 159.99,
                'category': 'hair-accessories',
                'stock': 8,
                'is_featured': True,
                'accent': (230, 215, 140),
            },
            {
                'name': 'Choker Pearl Set',
                'slug': 'choker-pearl-set',
                'description': 'Pearl choker with matching earrings. A timeless bridal set.',
                'price': 199.99,
                'category': 'necklaces',
                'stock': 12,
                'is_featured': False,
                'accent': (210, 200, 185),
            },
            {
                'name': 'Hoop Earrings with Crystals',
                'slug': 'hoop-earrings-crystals',
                'description': 'Elegant hoop earrings adorned with small crystals. Perfect for the modern bride.',
                'price': 69.99,
                'category': 'earrings',
                'stock': 30,
                'is_featured': False,
                'accent': (176, 141, 87),
            },
            {
                'name': 'Pearl Bracelet',
                'slug': 'pearl-bracelet',
                'description': 'Single strand freshwater pearl bracelet with gold clasp.',
                'price': 89.99,
                'category': 'bracelets',
                'stock': 18,
                'is_featured': False,
                'accent': (200, 190, 175),
            },
            {
                'name': 'Gold Filigree Bangle',
                'slug': 'gold-filigree-bangle',
                'description': 'Hand-engraved filigree bangle in antique gold finish.',
                'price': 119.99,
                'category': 'bracelets',
                'stock': 14,
                'is_featured': True,
                'accent': (170, 130, 60),
            },
            {
                'name': 'Sapphire Stud Set',
                'slug': 'sapphire-stud-set',
                'description': 'Deep blue sapphire studs with halo setting for evening receptions.',
                'price': 94.99,
                'category': 'earrings',
                'stock': 22,
                'is_featured': False,
                'accent': (65, 105, 180),
            },
        ]

        for p in products_data:
            cat = created_cats[p['category']]
            on_sale = bool(p.get('is_on_sale'))
            compare = p.get('compare_at_price') if on_sale else None
            product, created = Product.objects.get_or_create(
                slug=p['slug'],
                defaults={
                    'name': p['name'],
                    'description': p['description'],
                    'price': p['price'],
                    'category': cat,
                    'stock': p['stock'],
                    'is_featured': p['is_featured'],
                    'is_on_sale': on_sale,
                    'compare_at_price': compare,
                },
            )
            if created:
                self.stdout.write(f'  Created product: {product.name}')
            else:
                # Keep demo fields in sync when re-running seed
                Product.objects.filter(pk=product.pk).update(
                    name=p['name'],
                    description=p['description'],
                    price=p['price'],
                    category=cat,
                    stock=p['stock'],
                    is_featured=p['is_featured'],
                    is_on_sale=on_sale,
                    compare_at_price=compare,
                )
                product.refresh_from_db()

            accent = p.get('accent', (184, 134, 11))
            _ensure_product_images(product, accent, self.stdout)

        self.stdout.write(self.style.SUCCESS('Seed completed.'))
