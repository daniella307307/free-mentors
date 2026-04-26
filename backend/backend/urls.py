from django.conf import settings
from django.urls import path
from graphene_django.views import GraphQLView # type: ignore
from django.views.decorators.csrf import csrf_exempt

graphql_view = GraphQLView.as_view(graphiql=settings.DEBUG)
if settings.DEBUG:
    graphql_view = csrf_exempt(graphql_view)

urlpatterns = [
    path("graphql/", graphql_view),
]
