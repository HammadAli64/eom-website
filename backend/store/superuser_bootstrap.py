import logging
import os
import sys

from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError


logger = logging.getLogger(__name__)


def _is_enabled(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


def ensure_superuser_from_env() -> None:
    """
    Create/update a superuser from environment variables.
    Safe to call on startup; exits quietly when DB is not ready.
    """
    # Avoid side effects for most management commands.
    if len(sys.argv) > 1 and sys.argv[1] in {"makemigrations", "collectstatic", "shell"}:
        return

    if not _is_enabled(os.environ.get("DJANGO_SUPERUSER_CREATE", "false")):
        return

    email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip()
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "").strip()
    username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "").strip()

    if not email or not password:
        logger.warning(
            "Skipping superuser bootstrap: DJANGO_SUPERUSER_EMAIL or DJANGO_SUPERUSER_PASSWORD missing."
        )
        return

    if not username:
        username = email.split("@", 1)[0]

    User = get_user_model()

    try:
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": username,
                "is_staff": True,
                "is_superuser": True,
            },
        )
    except (OperationalError, ProgrammingError):
        # Database or auth tables may not exist yet (before migrations).
        return

    changed = False
    if user.username != username:
        user.username = username
        changed = True
    if not user.is_staff:
        user.is_staff = True
        changed = True
    if not user.is_superuser:
        user.is_superuser = True
        changed = True

    if created or not user.check_password(password):
        user.set_password(password)
        changed = True

    if changed:
        user.save()

