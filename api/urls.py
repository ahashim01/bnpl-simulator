from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import InstallmentPayView, PaymentPlanViewSet

router = DefaultRouter()
router.register("plans", PaymentPlanViewSet, basename="plans")
router.register("installments", InstallmentPayView, basename="installments")

urlpatterns = [
    path("", include(router.urls)),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
