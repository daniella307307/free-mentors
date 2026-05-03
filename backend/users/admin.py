from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import MentorReview, MentorshipSession, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "role", "is_staff", "is_active", "date_joined")
    list_filter = ("role", "is_staff", "is_active", "is_superuser")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email", "address")}),
        (
            "Mentorship profile",
            {"fields": ("bio", "occupation", "expertise", "profile_picture")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "role", "is_staff", "is_superuser"),
            },
        ),
    )


@admin.register(MentorshipSession)
class MentorshipSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "mentor", "mentee", "session_date", "session_time", "status", "created_at")
    list_filter = ("status", "session_date")
    search_fields = ("mentor__email", "mentee__email", "mentor__username", "mentee__username")
    raw_id_fields = ("mentor", "mentee")


@admin.register(MentorReview)
class MentorReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "mentor", "reviewer", "rating", "flagged", "hidden", "created_at")
    list_filter = ("flagged", "hidden", "rating")
    search_fields = ("mentor__email", "reviewer__email", "comment")
    raw_id_fields = ("mentor", "reviewer")
