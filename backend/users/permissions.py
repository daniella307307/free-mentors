"""Role checks for GraphQL and other backend code."""

from graphql import GraphQLError  # type: ignore

from .models import User


def is_admin(user) -> bool:
    return bool(user and user.role == User.Role.ADMIN)


def is_mentor(user) -> bool:
    return bool(user and user.role == User.Role.MENTOR)


def is_user_role(user) -> bool:
    """Application 'mentee' / normal user role (not Django staff flag)."""
    return bool(user and user.role == User.Role.USER)


def require_authenticated(info):
    from .graphql_auth import get_auth_user

    user = get_auth_user(info)
    if not user:
        raise GraphQLError("Authentication required.")
    return user


def require_admin(info):
    user = require_authenticated(info)
    if not is_admin(user):
        raise GraphQLError("Admin access required.")
    return user
