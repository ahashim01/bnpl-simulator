from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.core.management import call_command
from django.utils import timezone

from .models import Installment, Status


@shared_task
def send_upcoming_payment_reminders():
    """Send reminders for installments due in the next 3 days."""
    today = timezone.now().date()
    reminder_date = today + timedelta(days=3)

    upcoming_installments = Installment.objects.filter(status=Status.PENDING, due_date=reminder_date).select_related(
        "plan__customer"
    )

    for installment in upcoming_installments:
        customer = installment.plan.customer

        # In a production environment, you would send real emails
        # This is a mock implementation
        send_mail(
            subject="Payment Reminder: Installment due in 3 days",
            message=f"""
            Dear {customer.username},

            This is a reminder that your installment payment of {installment.amount} SAR is due in 3 days on {installment.due_date}.

            Please log in to your account to make the payment.

            Thank you,
            BNPL Payment System
            """,  # noqa
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[customer.email],
            fail_silently=True,
        )

    return f"Sent {upcoming_installments.count()} payment reminders"


@shared_task
def send_overdue_payment_notifications():
    """Send notifications for overdue installments."""
    today = timezone.now().date()

    overdue_installments = Installment.objects.filter(
        status=Status.LATE,
    ).select_related("plan__customer")

    for installment in overdue_installments:
        customer = installment.plan.customer
        days_overdue = (today - installment.due_date).days

        # Only send notifications for newly overdue installments (1 day)
        if days_overdue == 1:
            # In a production environment, you would send real emails
            # This is a mock implementation
            send_mail(
                subject="OVERDUE: Your payment is past due",
                message=f"""
                Dear {customer.username},

                Your installment payment of {installment.amount} SAR was due on {installment.due_date} and is now overdue.

                Please log in to your account to make the payment as soon as possible to avoid additional fees.

                Thank you,
                BNPL Payment System
                """,  # noqa
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[customer.email],
                fail_silently=True,
            )

    return f"Sent {overdue_installments.count()} overdue notifications"


@shared_task
def update_late_installments():
    """Update overdue installments to Late status using the management command."""
    call_command("update_late_installments")
    return "Updated late installments"
