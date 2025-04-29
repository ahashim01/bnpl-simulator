from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for the User model with performance optimizations."""

    list_display = ("username", "email", "first_name", "last_name", "is_merchant", "is_staff", "date_joined")
    list_filter = ("is_merchant", "is_staff", "is_active", "date_joined")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-date_joined",)

    # Optimize queryset for better performance
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

    # Add custom fieldsets to include 'is_merchant' field
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "email")}),
        (_("User type"), {"fields": ("is_merchant",)}),
        (
            _("Permissions"),
            {
                "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    # Show is_merchant in the add form too
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "is_merchant"),
            },
        ),
    )
