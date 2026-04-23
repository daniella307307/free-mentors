from django.urls import path
from graphene_django.views import GraphQLView # type: ignore


urlpatterns = [
    path("graphql/", GraphQLView.as_view(graphiql=True)),
]
