from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
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


# Add this new view for listing customers
class CustomerListView(generics.ListAPIView):
    """
    API endpoint to list all customers (non-merchant users).
    Only accessible to merchants.
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = CustomerSerializer

    def get_queryset(self):
        # Only return customers (users with is_merchant=False)
        # And only if the requesting user is a merchant
        if self.request.user.is_merchant:
            return User.objects.filter(is_merchant=False)
        # If not a merchant, return empty queryset
        return User.objects.none()


# Keep existing classes
class PaymentPlanViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = (IsMerchantOrOwner,)

    def get_queryset(self):
        user = self.request.user
        if user.is_merchant:
            return (
                PaymentPlan.objects.filter(merchant=user)
                .select_related("merchant", "customer")
                .prefetch_related("installments")
            )
        return PaymentPlan.objects.filter(customer=user).prefetch_related("installments")

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentPlanCreateSerializer
        return PaymentPlanReadSerializer

    def perform_create(self, serializer):
        serializer.save()

    # Override create method to properly handle the response
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.save()

        # Use the read serializer for the response
        read_serializer = PaymentPlanReadSerializer(plan, context=self.get_serializer_context())
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class InstallmentPayView(viewsets.GenericViewSet, mixins.UpdateModelMixin):
    queryset = Installment.objects.all()
    serializer_class = InstallmentSerializer
    permission_classes = (CanPayInstallment,)  # Use our new permission class

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        inst: Installment = self.get_object()
        if inst.status == Status.PAID:
            return Response({"detail": "Already paid."}, status=status.HTTP_400_BAD_REQUEST)
        inst.status = Status.PAID
        inst.paid_at = timezone.now()
        inst.save(update_fields=["status", "paid_at"])
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
