"""
Django settings for bridal jewelry eCommerce backend.
"""
import os
from pathlib import Path

# Load .env from backend directory so EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, etc. are set
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-secret-key-change-in-production')

DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

def _env_list(name: str, default: str = "") -> list[str]:
    raw = os.environ.get(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


def _normalize_origin(value: str) -> str:
    origin = value.strip().rstrip("/")
    if origin and not origin.startswith(("http://", "https://")):
        origin = f"https://{origin}"
    return origin


def _normalized_origins(name: str) -> list[str]:
    return [_normalize_origin(item) for item in _env_list(name) if _normalize_origin(item)]

ALLOWED_HOSTS = _env_list('ALLOWED_HOSTS', 'localhost,127.0.0.1')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'store',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database: PostgreSQL via DATABASE_URL (Railway) or POSTGRES_* / PG* in .env
def _database_from_env():
    # Railway: private URL when Postgres is linked; DATABASE_PUBLIC_URL is the public proxy (e.g. local tools)
    database_url = (
        os.environ.get('DATABASE_URL', '').strip()
        or os.environ.get('DATABASE_PUBLIC_URL', '').strip()
    )
    if database_url:
        import dj_database_url
        # Railway / Heroku sometimes use postgres:// — normalize for psycopg
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        return {'default': dj_database_url.parse(database_url, conn_max_age=600)}

    pg_host = (os.environ.get('POSTGRES_HOST') or os.environ.get('PGHOST') or '').strip()
    if pg_host:
        return {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.environ.get('POSTGRES_DB') or os.environ.get('PGDATABASE') or 'postgres',
                'USER': os.environ.get('POSTGRES_USER') or os.environ.get('PGUSER') or 'postgres',
                'PASSWORD': os.environ.get('POSTGRES_PASSWORD') or os.environ.get('PGPASSWORD') or '',
                'HOST': pg_host,
                'PORT': os.environ.get('POSTGRES_PORT') or os.environ.get('PGPORT') or '5432',
                'CONN_MAX_AGE': 600,
            }
        }

    if os.environ.get('USE_SQLITE', '').lower() in ('1', 'true', 'yes'):
        return {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }

    return {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


DATABASES = _database_from_env()

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'store.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}

# CORS - allow Next.js frontend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS_ALLOWED_ORIGINS += _normalized_origins('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = _normalized_origins('CSRF_TRUSTED_ORIGINS')

# Railway/Proxy settings for HTTPS-aware request handling
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Email (SMTP) - use Gmail App Password; From must match sending account to avoid spam/rejection
EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    'django.core.mail.backends.smtp.EmailBackend'
)
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
# When using Gmail, From must be your Gmail address (or verified alias) or mail is rejected/spam
_EMAIL_USER = EMAIL_HOST_USER or 'your-email@gmail.com'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', f'Bridal Jewelry Store <{_EMAIL_USER}>')
SERVER_EMAIL = DEFAULT_FROM_EMAIL  # for admin error emails
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', _EMAIL_USER)

# Media files (product images)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
