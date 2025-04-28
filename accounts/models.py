from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Extends Django's auth user with a single switch:
    - `is_merchant` separates merchant UI from customer UI.
    """

    is_merchant = models.BooleanField(default=False)

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

    def __str__(self) -> str:  # helps debugging in Django admin / shell
        role = "Merchant" if self.is_merchant else "Customer"
        return f"{self.username} ({role})"
