import os

from celery import Celery

# Set the default Django settings module for the 'celery' program
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("bnpl")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Configure Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    "send-payment-reminders": {
        "task": "payments.tasks.send_upcoming_payment_reminders",
        "schedule": 86400.0,  # Once a day (in seconds)
    },
    "check-overdue-payments": {
        "task": "payments.tasks.send_overdue_payment_notifications",
        "schedule": 86400.0,  # Once a day (in seconds)
    },
    "update-late-installments": {
        "task": "payments.tasks.update_late_installments",
        "schedule": 86400.0,  # Once a day (in seconds)
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
