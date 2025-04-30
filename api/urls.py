from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import CustomerListView, CustomersWithPlansView, InstallmentPayView, PaymentPlanViewSet, RegisterView

router = DefaultRouter()
router.register(r"plans", PaymentPlanViewSet, basename="plans")
router.register(r"installments", InstallmentPayView, basename="installments")

urlpatterns = [
    path("", include(router.urls)),
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Customer endpoints
    path("customers/", CustomerListView.as_view(), name="customer-list"),
    path("customers/with-plans/", CustomersWithPlansView.as_view(), name="customers-with-plans"),
]
