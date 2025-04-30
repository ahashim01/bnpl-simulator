from decimal import ROUND_HALF_UP, Decimal

from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.db import models, transaction
from django.utils.translation import gettext_lazy as _


class Status(models.TextChoices):
    PENDING = "P", _("Pending")
    PAID = "D", _("Paid")  # D for "Done" avoids clash with P
    LATE = "L", _("Late")


class PaymentPlan(models.Model):
    merchant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="merchant_plans",
        limit_choices_to={"is_merchant": True},
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_plans",
        limit_choices_to={"is_merchant": False},
    )
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Plan {self.id} • {self.customer_id} • {self.total_amount} SAR"

    # ---------- factory method ----------
    def generate_installments(self, *, count: int) -> None:
        """
        Split `total_amount` into `count` installments.

        Uses ROUND_HALF_UP to mirror banking rules.
        The last installment is corrected so the total sums exactly.
        """
        assert count > 0, "Installment count must be positive"
        tranche = (self.total_amount / count).quantize(Decimal("0.01"), ROUND_HALF_UP)
        accumulated = Decimal("0.00")

        with transaction.atomic():
            for idx in range(1, count + 1):
                amount = tranche if idx < count else self.total_amount - accumulated
                due = self.start_date + relativedelta(months=idx - 1)
                Installment.objects.create(plan=self, sequence=idx, amount=amount, due_date=due)
                accumulated += amount


class Installment(models.Model):
    plan = models.ForeignKey(PaymentPlan, on_delete=models.CASCADE, related_name="installments")
    sequence = models.PositiveSmallIntegerField()  # 1-based order
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=1, choices=Status.choices, default=Status.PENDING)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [("plan", "sequence")]
        ordering = ["sequence"]
        # Add composite index for common filtered queries
        indexes = [
            models.Index(fields=["plan", "status"]),
            models.Index(fields=["status", "due_date"]),  # For payment reminders query
        ]

    def __str__(self):
        return f"Inst {self.sequence} • Plan {self.plan_id} • {self.amount} SAR"
