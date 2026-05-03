"""Attach JWT-authenticated user to the request for GraphQL resolvers."""


class GraphQLJWTUserMiddleware:
    """Populate request.graphql_user from Bearer token on /graphql/."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.graphql_user = None
        path = request.path or ""
        if "graphql" in path:
            from .graphql_auth import decode_jwt_user_id

            request.graphql_user = decode_jwt_user_id(request)
        return self.get_response(request)
