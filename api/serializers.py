from rest_framework import serializers

from accounts.models import User
from payments.models import Installment, PaymentPlan, Status


class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = ("id", "sequence", "due_date", "amount", "status")


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class PaymentPlanCreateSerializer(serializers.Serializer):
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    start_date = serializers.DateField()
    installments = serializers.IntegerField(min_value=1)
    customer_email = serializers.EmailField()

    def validate_customer_email(self, value):
        # Check if customer exists with this email
        try:
            User.objects.get(email=value, is_merchant=False)
        except User.DoesNotExist:
            raise serializers.ValidationError("No customer found with this email address")

        # Check if email belongs to a merchant
        if User.objects.filter(email=value, is_merchant=True).exists():
            raise serializers.ValidationError("This email belongs to a merchant, not a customer")

        return value

    def create(self, validated_data):
        merchant = self.context["request"].user
        customer_email = validated_data.pop("customer_email")

        # Get customer by email
        customer = User.objects.get(email=customer_email, is_merchant=False)

        plan = PaymentPlan.objects.create(
            merchant=merchant,
            customer=customer,
            total_amount=validated_data["total_amount"],
            start_date=validated_data["start_date"],
        )
        plan.generate_installments(count=validated_data["installments"])
        return plan


class PaymentPlanReadSerializer(serializers.ModelSerializer):
    installments = InstallmentSerializer(many=True, read_only=True)
    customer = CustomerSerializer(read_only=True)
    merchant = CustomerSerializer(read_only=True)
    total_installments = serializers.SerializerMethodField()
    paid_installments = serializers.SerializerMethodField()

    class Meta:
        model = PaymentPlan
        fields = (
            "id",
            "total_amount",
            "status",
            "start_date",
            "customer",
            "merchant",
            "installments",
            "total_installments",
            "paid_installments",
        )

    def get_total_installments(self, obj):
        return obj.installments.count()

    def get_paid_installments(self, obj):
        # Fixed: Use the correct Status.PAID value instead of "D"
        return obj.installments.filter(status=Status.PAID).count()
