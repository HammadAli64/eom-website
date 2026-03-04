"""
Simple admin token auth decorator. Validates token from Authorization header.
"""
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
import base64
from .models import AdminUser


def get_admin_from_token(request):
    """Extract admin from Authorization: Bearer <token>. Token format: base64(username:timestamp)."""
    auth = request.META.get('HTTP_AUTHORIZATION')
    if not auth or not auth.startswith('Bearer '):
        return None
    token = auth[7:].strip()
    try:
        decoded = base64.b64decode(token).decode()
        username = decoded.split(':', 1)[0]
        admin = AdminUser.objects.get(username=username)
        return admin
    except Exception:
        return None


def admin_jwt_required(view_func):
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        admin = get_admin_from_token(request)
        if not admin:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        request.admin_user = admin
        return view_func(request, *args, **kwargs)
    return wrapped
