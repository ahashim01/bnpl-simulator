from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import generics, mixins, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import User
from payments.models import Installment, PaymentPlan, Status

from .permissions import IsMerchantOrOwner
from .serializers import InstallmentSerializer, PaymentPlanCreateSerializer, PaymentPlanReadSerializer


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


class InstallmentPayView(viewsets.GenericViewSet, mixins.UpdateModelMixin):
    queryset = Installment.objects.all()
    serializer_class = InstallmentSerializer
    permission_classes = (IsMerchantOrOwner,)

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
