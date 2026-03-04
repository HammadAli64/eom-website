"""
Seed database with sample bridal jewelry data.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from store.models import Category, Product, ProductImage, AdminUser

User = get_user_model()


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

        # Sample products (no real images - use placeholders)
        products_data = [
            {
                'name': 'Pearl Cascade Necklace',
                'slug': 'pearl-cascade-necklace',
                'description': 'Stunning multi-strand pearl necklace with sterling silver clasp. Perfect for your wedding day.',
                'price': 189.99,
                'category': 'necklaces',
                'stock': 15,
                'is_featured': True,
            },
            {
                'name': 'Crystal Drop Earrings',
                'slug': 'crystal-drop-earrings',
                'description': 'Elegant crystal drop earrings with gold plating. Lightweight and comfortable for all-day wear.',
                'price': 79.99,
                'category': 'earrings',
                'stock': 25,
                'is_featured': True,
            },
            {
                'name': 'Diamond Tennis Bracelet',
                'slug': 'diamond-tennis-bracelet',
                'description': 'Classic tennis bracelet with cubic zirconia stones set in rhodium-plated silver.',
                'price': 249.99,
                'category': 'bracelets',
                'stock': 10,
                'is_featured': True,
            },
            {
                'name': 'Vintage Rose Gold Ring',
                'slug': 'vintage-rose-gold-ring',
                'description': 'Vintage-inspired rose gold band with delicate filigree design.',
                'price': 129.99,
                'category': 'rings',
                'stock': 20,
                'is_featured': False,
            },
            {
                'name': 'Bridal Tiara',
                'slug': 'bridal-tiara',
                'description': 'Sparkling bridal tiara with crystal accents. Adjustable for a perfect fit.',
                'price': 159.99,
                'category': 'hair-accessories',
                'stock': 8,
                'is_featured': True,
            },
            {
                'name': 'Choker Pearl Set',
                'slug': 'choker-pearl-set',
                'description': 'Pearl choker with matching earrings. A timeless bridal set.',
                'price': 199.99,
                'category': 'necklaces',
                'stock': 12,
                'is_featured': False,
            },
            {
                'name': 'Hoop Earrings with Crystals',
                'slug': 'hoop-earrings-crystals',
                'description': 'Elegant hoop earrings adorned with small crystals. Perfect for the modern bride.',
                'price': 69.99,
                'category': 'earrings',
                'stock': 30,
                'is_featured': False,
            },
            {
                'name': 'Pearl Bracelet',
                'slug': 'pearl-bracelet',
                'description': 'Single strand freshwater pearl bracelet with gold clasp.',
                'price': 89.99,
                'category': 'bracelets',
                'stock': 18,
                'is_featured': False,
            },
        ]

        for p in products_data:
            cat = created_cats[p['category']]
            product, created = Product.objects.get_or_create(
                slug=p['slug'],
                defaults={
                    'name': p['name'],
                    'description': p['description'],
                    'price': p['price'],
                    'category': cat,
                    'stock': p['stock'],
                    'is_featured': p['is_featured'],
                }
            )
            if created:
                self.stdout.write(f'  Created product: {product.name}')

        self.stdout.write(self.style.SUCCESS('Seed completed.'))
