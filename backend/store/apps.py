from django.apps import AppConfig


class StoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'store'
    verbose_name = 'Bridal Jewelry Store'

    def ready(self):
        # Import inside ready() to avoid touching models during app loading.
        from .superuser_bootstrap import ensure_superuser_from_env
        ensure_superuser_from_env()
