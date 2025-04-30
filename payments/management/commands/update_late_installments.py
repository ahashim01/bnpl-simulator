from django.core.management.base import BaseCommand
from django.utils import timezone

from payments.models import Installment, Status


class Command(BaseCommand):
    help = "Updates overdue installments to Late status"

    def handle(self, *args, **options):
        today = timezone.now().date()

        # Find all PENDING installments with due_dates in the past
        overdue_installments = Installment.objects.filter(status=Status.PENDING, due_date__lt=today)

        count = overdue_installments.count()
        if count:
            overdue_installments.update(status=Status.LATE)
            self.stdout.write(self.style.SUCCESS(f"Successfully updated {count} installments to Late status"))
        else:
            self.stdout.write("No overdue installments found")
