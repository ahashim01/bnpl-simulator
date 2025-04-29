from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import InstallmentPayView, PaymentPlanViewSet

router = DefaultRouter()
router.register("plans", PaymentPlanViewSet, basename="plans")
router.register("installments", InstallmentPayView, basename="installments")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/", include("rest_framework_simplejwt.urls")),  # /token/ & /refresh/
]
