from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Tweet
from .models import User
from .models import UserFollow


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ["__str__", "email", "username", "date_joined"]
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            "Personal info",
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "email",
                    "about",
                    "location",
                    "timezone",
                    "avatar_url",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
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
                "fields": ("username", "email", "password1", "password2"),
            },
        ),
    )


class TweetAdmin(admin.ModelAdmin):
    list_display = ["__str__", "body", "user", "created"]


admin.site.register(Tweet, TweetAdmin)
admin.site.register(User, CustomUserAdmin)
admin.site.register(UserFollow)
