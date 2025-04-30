from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import generics, mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from payments.models import Installment, PaymentPlan, Status

from .permissions import CanPayInstallment, IsMerchantOrOwner
from .serializers import (
    CustomerSerializer,
    InstallmentSerializer,
    PaymentPlanCreateSerializer,
    PaymentPlanReadSerializer,
)


def get_cache_key(user_id, prefix="plans"):
    """Generate a unique cache key based on user ID and prefix."""
    return f"{prefix}:{user_id}"


class CustomersWithPlansView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomerSerializer

    @method_decorator(cache_page(settings.CACHE_TTL))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_queryset(self):
        # Only merchants can access this endpoint
        if not self.request.user.is_merchant:
            return User.objects.none()

        # Get customers who have plans with the current merchant
        merchant_id = self.request.user.id
        return (
            User.objects.filter(is_merchant=False, customer_plans__merchant_id=merchant_id)
            .distinct()
            .only("id", "username", "email")
        )


class CustomerListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomerSerializer

    @method_decorator(cache_page(settings.CACHE_TTL))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_queryset(self):
        if self.request.user.is_merchant:
            return User.objects.filter(is_merchant=False).only("id", "username", "email")
        return User.objects.none()


class PaymentPlanViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    permission_classes = (IsAuthenticated, IsMerchantOrOwner)

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentPlanCreateSerializer
        return PaymentPlanReadSerializer

    def get_queryset(self):
        user = self.request.user

        # Check if we have a cached version
        cache_key = get_cache_key(user.id)
        cached_queryset = cache.get(cache_key)

        if cached_queryset is not None and not settings.DEBUG:
            return cached_queryset

        # If no cache, build the queryset
        base_queryset = PaymentPlan.objects.select_related("merchant", "customer")

        if user.is_merchant:
            queryset = base_queryset.filter(merchant=user)
        else:
            queryset = base_queryset.filter(customer=user)

        queryset = queryset.prefetch_related("installments")

        # Cache the queryset
        if not settings.DEBUG:
            cache.set(cache_key, queryset, settings.CACHE_TTL)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.save()

        # Invalidate cache after creating a new plan
        cache_key = get_cache_key(request.user.id)
        cache.delete(cache_key)

        # For customer cache invalidation
        customer_id = plan.customer_id
        if customer_id:
            customer_cache_key = get_cache_key(customer_id)
            cache.delete(customer_cache_key)

        # Use the read serializer for the response
        read_serializer = PaymentPlanReadSerializer(plan, context=self.get_serializer_context())
        # Use read_serializer.data for headers instead of serializer.data
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class InstallmentPayView(viewsets.GenericViewSet, mixins.UpdateModelMixin):
    queryset = Installment.objects.select_related("plan__customer", "plan__merchant")
    serializer_class = InstallmentSerializer
    permission_classes = (CanPayInstallment,)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        inst = self.get_object()
        if inst.status == Status.PAID:
            return Response({"detail": "Already paid."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            inst.status = Status.PAID
            inst.paid_at = timezone.now()
            inst.save(update_fields=["status", "paid_at"])

            unpaid_count = inst.plan.installments.exclude(status=Status.PAID).count()
            if unpaid_count == 0:
                inst.plan.status = Status.PAID
                inst.plan.save(update_fields=["status"])

        # Invalidate caches after payment
        customer_cache_key = get_cache_key(inst.plan.customer_id)
        merchant_cache_key = get_cache_key(inst.plan.merchant_id)

        cache.delete(customer_cache_key)
        cache.delete(merchant_cache_key)

        return Response(self.get_serializer(inst).data, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    permission_classes = ()
    authentication_classes = ()

    class Serializer(serializers.ModelSerializer):
        password = serializers.CharField(write_only=True)
        email = serializers.EmailField(required=True)

        class Meta:
            model = User
            fields = ("username", "email", "password", "first_name", "last_name", "is_merchant")

        def validate_password(self, value):
            validate_password(value)
            return value

        def validate_email(self, value):
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("A user with this email already exists.")
            return value

        def create(self, validated_data):
            return User.objects.create_user(**validated_data)

    serializer_class = Serializer
