from rest_framework import serializers

from accounts.models import User
from payments.models import Installment, PaymentPlan


class InstallmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installment
        fields = ("id", "sequence", "due_date", "amount", "status")


class PaymentPlanCreateSerializer(serializers.Serializer):
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    start_date = serializers.DateField()
    installments = serializers.IntegerField(min_value=1)
    customer_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_merchant=False))

    def create(self, validated):
        merchant = self.context["request"].user
        plan = PaymentPlan.objects.create(
            merchant=merchant,
            customer=validated["customer_id"],
            total_amount=validated["total_amount"],
            start_date=validated["start_date"],
        )
        plan.generate_installments(count=validated["installments"])
        return plan


class PaymentPlanReadSerializer(serializers.ModelSerializer):
    installments = InstallmentSerializer(many=True, read_only=True)

    class Meta:
        model = PaymentPlan
        fields = ("id", "total_amount", "status", "start_date", "installments")
