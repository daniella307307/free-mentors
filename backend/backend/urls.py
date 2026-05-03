from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView  # type: ignore

graphql_view = csrf_exempt(
    GraphQLView.as_view(graphiql=settings.DEBUG),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("graphql/", graphql_view),
]
