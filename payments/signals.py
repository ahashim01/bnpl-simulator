from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Installment, Status


@receiver(post_save, sender=Installment)
def update_plan_on_paid(sender, instance: Installment, **kwargs):
    if instance.status != Status.PAID:
        return

    plan = instance.plan
    # any unpaid or late installments left?
    remaining = plan.installments.filter(status__in=[Status.PENDING, Status.LATE]).exists()
    if not remaining:
        plan.status = Status.PAID
        plan.save(update_fields=["status"])
