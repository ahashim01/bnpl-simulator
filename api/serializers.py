import bleach
from django.core.validators import EmailValidator, MinValueValidator
from rest_framework import serializers

from accounts.models import User
from payments.models import Installment, PaymentPlan, Status


class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = ("id", "sequence", "due_date", "amount", "status")


class CustomerSerializer(serializers.ModelSerializer):
    # Use the built-in EmailValidator
    email = serializers.EmailField(validators=[EmailValidator()])

    # Sanitize text fields
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret["username"] = bleach.clean(ret["username"])
        ret["email"] = bleach.clean(ret["email"])
        return ret

    class Meta:
        model = User
        fields = ("id", "username", "email")


class PaymentPlanCreateSerializer(serializers.Serializer):
    total_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01, message="Amount must be positive")]
    )
    start_date = serializers.DateField()
    installments = serializers.IntegerField(
        min_value=1,
        max_value=48,  # Set a reasonable maximum
        error_messages={
            "min_value": "At least 1 installment is required.",
            "max_value": "Cannot exceed 48 installments.",
        },
    )
    customer_email = serializers.EmailField(validators=[EmailValidator()])

    def validate(self, data):
        """
        Cross-field validation to ensure reasonable values.
        """
        if "total_amount" in data and "installments" in data:
            # Minimum installment amount (e.g., at least $5)
            min_installment = 5.0
            installment_amount = float(data["total_amount"]) / data["installments"]

            if installment_amount < min_installment:
                raise serializers.ValidationError(
                    f"Each installment would be {installment_amount:.2f}, which is below the minimum of {min_installment:.2f}."  # noqa: E501
                )

        # Ensure start_date is not too far in the future (e.g., max 1 year)
        if "start_date" in data:
            from datetime import date, timedelta

            max_future_date = date.today() + timedelta(days=365)

            if data["start_date"] > max_future_date:
                raise serializers.ValidationError("Start date cannot be more than a year in the future.")

        return data

    def validate_customer_email(self, value):
        # Sanitize input
        value = bleach.clean(value)

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
        return obj.installments.filter(status=Status.PAID).count()
