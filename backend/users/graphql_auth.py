"""JWT authentication for GraphQL (Bearer token)."""

import jwt  # type: ignore
from django.conf import settings

from .models import User


def _authorization_header(request):
    """Support Django HttpRequest (META / headers) and test doubles with a dict `headers`."""
    meta = getattr(request, "META", None)
    if meta is not None:
        return meta.get("HTTP_AUTHORIZATION") or ""
    h = getattr(request, "headers", None)
    if h is None:
        return ""
    if isinstance(h, dict):
        return h.get("Authorization", "") or ""
    try:
        return h.get("Authorization", "") or ""
    except (AttributeError, TypeError):
        return ""


def get_auth_user(info):
    """
    Resolve the authenticated application user from GraphQL context (HttpRequest).
    Uses request.graphql_user when middleware has already decoded the token.
    """
    request = info.context
    cached = getattr(request, "graphql_user", None)
    if cached is not None:
        return cached

    auth_header = _authorization_header(request)
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None

    uid = payload.get("user_id")
    if uid is None:
        return None
    try:
        return User.objects.filter(pk=uid).first()
    except (ValueError, TypeError):
        return None


def decode_jwt_user_id(request):
    """Return User instance from Authorization header, or None."""
    auth_header = _authorization_header(request)
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None
    uid = payload.get("user_id")
    if uid is None:
        return None
    try:
        return User.objects.filter(pk=uid).first()
    except (ValueError, TypeError):
        return None
