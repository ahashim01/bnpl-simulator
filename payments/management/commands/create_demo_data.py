from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from payments.models import Installment, PaymentPlan, Status

User = get_user_model()


class Command(BaseCommand):
    help = "Creates demo data for the BNPL application"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Creating demo data..."))

        # Create merchant user
        merchant, created = User.objects.get_or_create(
            username="merchant",
            defaults={
                "email": "merchant@example.com",
                "is_merchant": True,
            },
        )

        if created:
            merchant.set_password("merchant123")
            merchant.save()
            self.stdout.write(self.style.SUCCESS(f"Created merchant user: {merchant.username}"))

        # Create customer users
        customers = []
        for i in range(1, 4):
            customer, created = User.objects.get_or_create(
                username=f"customer{i}",
                defaults={
                    "email": f"customer{i}@example.com",
                    "is_merchant": False,
                },
            )

            if created:
                customer.set_password("customer123")
                customer.save()
                self.stdout.write(self.style.SUCCESS(f"Created customer user: {customer.username}"))

            customers.append(customer)

        # Create payment plans with different statuses
        plans_data = [
            {
                "customer": customers[0],
                "total_amount": Decimal("1200.00"),
                "installments": [
                    {
                        "amount": Decimal("400.00"),
                        "due_date": timezone.now() - timedelta(days=30),
                        "status": Status.PAID,
                        "sequence": 1,
                    },
                    {
                        "amount": Decimal("400.00"),
                        "due_date": timezone.now() + timedelta(days=0),
                        "status": Status.PENDING,
                        "sequence": 2,
                    },
                    {
                        "amount": Decimal("400.00"),
                        "due_date": timezone.now() + timedelta(days=30),
                        "status": Status.PENDING,
                        "sequence": 3,
                    },
                ],
            },
            {
                "customer": customers[1],
                "total_amount": Decimal("900.00"),
                "installments": [
                    {
                        "amount": Decimal("300.00"),
                        "due_date": timezone.now() - timedelta(days=60),
                        "status": Status.PAID,
                        "sequence": 1,
                    },
                    {
                        "amount": Decimal("300.00"),
                        "due_date": timezone.now() - timedelta(days=30),
                        "status": Status.PAID,
                        "sequence": 2,
                    },
                    {
                        "amount": Decimal("300.00"),
                        "due_date": timezone.now() + timedelta(days=0),
                        "status": Status.PENDING,
                        "sequence": 3,
                    },
                ],
            },
            {
                "customer": customers[2],
                "total_amount": Decimal("600.00"),
                "installments": [
                    {
                        "amount": Decimal("200.00"),
                        "due_date": timezone.now() - timedelta(days=30),
                        "status": Status.PAID,
                        "sequence": 1,
                    },
                    {
                        "amount": Decimal("200.00"),
                        "due_date": timezone.now() - timedelta(days=15),
                        "status": Status.LATE,
                        "sequence": 2,
                    },
                    {
                        "amount": Decimal("200.00"),
                        "due_date": timezone.now() + timedelta(days=15),
                        "status": Status.PENDING,
                        "sequence": 3,
                    },
                ],
            },
            {
                "customer": customers[0],
                "total_amount": Decimal("1500.00"),
                "installments": [
                    {
                        "amount": Decimal("500.00"),
                        "due_date": timezone.now() - timedelta(days=90),
                        "status": Status.PAID,
                        "sequence": 1,
                    },
                    {
                        "amount": Decimal("500.00"),
                        "due_date": timezone.now() - timedelta(days=60),
                        "status": Status.PAID,
                        "sequence": 2,
                    },
                    {
                        "amount": Decimal("500.00"),
                        "due_date": timezone.now() - timedelta(days=30),
                        "status": Status.PAID,
                        "sequence": 3,
                    },
                ],
            },
            {
                "customer": customers[1],
                "total_amount": Decimal("2400.00"),
                "installments": [
                    {
                        "amount": Decimal("600.00"),
                        "due_date": timezone.now() - timedelta(days=45),
                        "status": Status.PAID,
                        "sequence": 1,
                    },
                    {
                        "amount": Decimal("600.00"),
                        "due_date": timezone.now() - timedelta(days=15),
                        "status": Status.LATE,
                        "sequence": 2,
                    },
                    {
                        "amount": Decimal("600.00"),
                        "due_date": timezone.now() + timedelta(days=15),
                        "status": Status.PENDING,
                        "sequence": 3,
                    },
                    {
                        "amount": Decimal("600.00"),
                        "due_date": timezone.now() + timedelta(days=45),
                        "status": Status.PENDING,
                        "sequence": 4,
                    },
                ],
            },
        ]

        # Create the plans and installments
        for plan_data in plans_data:
            installments_data = plan_data.pop("installments")

            plan, created = PaymentPlan.objects.get_or_create(
                merchant=merchant,
                customer=plan_data["customer"],
                total_amount=plan_data["total_amount"],
                defaults={
                    "start_date": timezone.now() - timedelta(days=90),
                    "status": "pending",
                },
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created payment plan for customer: {plan.customer.username}"))

                # Create installments
                for inst_data in installments_data:
                    installment = Installment.objects.create(
                        plan=plan,
                        amount=inst_data["amount"],
                        due_date=inst_data["due_date"],
                        status=inst_data["status"],
                        sequence=inst_data["sequence"],
                    )
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  - Created installment: {installment.amount} due on {installment.due_date.date()}"
                        )
                    )

                # Update plan status based on installments
                if all(i.status == "paid" for i in plan.installments.all()):
                    plan.status = "paid"
                elif any(i.status == "late" for i in plan.installments.all()):
                    plan.status = "late"
                plan.save()

        self.stdout.write(self.style.SUCCESS("Demo data creation completed!"))
        self.stdout.write(self.style.SUCCESS("Merchant login: username=merchant, password=merchant123"))
        self.stdout.write(self.style.SUCCESS("Customer logins: username=customer1/2/3, password=customer123"))
