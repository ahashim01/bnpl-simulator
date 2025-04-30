from datetime import date, timedelta
from decimal import Decimal

from rest_framework.test import APITestCase

from accounts.models import User
from payments.models import PaymentPlan


class APIBaseTestCase(APITestCase):
    """Base test case with common functionality for API tests."""

    @classmethod
    def setUpTestData(cls):
        """Set up data for the whole TestCase."""
        # Create a merchant user
        cls.merchant = User.objects.create_user(
            username="merchant",
            email="merchant@example.com",
            password="password123",
            is_merchant=True,
            first_name="Merchant",
            last_name="User",
        )

        # Create a customer user
        cls.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="password123",
            is_merchant=False,
            first_name="Customer",
            last_name="User",
        )

        # Create another customer user for testing
        cls.customer2 = User.objects.create_user(
            username="customer2",
            email="customer2@example.com",
            password="password123",
            is_merchant=False,
            first_name="Customer",
            last_name="Two",
        )

        # Create another merchant for testing permissions
        cls.merchant2 = User.objects.create_user(
            username="merchant2",
            email="merchant2@example.com",
            password="password123",
            is_merchant=True,
            first_name="Merchant",
            last_name="Two",
        )

        # Set up payment plan data
        cls.plan_data = {
            "total_amount": Decimal("1000.00"),
            "start_date": date.today() + timedelta(days=7),
            "installments": 4,
            "customer_email": cls.customer.email,
        }

    def setUp(self):
        """Set up before each test."""
        self.client.logout()

    def authenticate_as_merchant(self):
        """Helper to authenticate as the merchant user."""
        self.client.force_authenticate(user=self.merchant)

    def authenticate_as_customer(self):
        """Helper to authenticate as the customer user."""
        self.client.force_authenticate(user=self.customer)

    def authenticate_as_merchant2(self):
        """Helper to authenticate as the second merchant user."""
        self.client.force_authenticate(user=self.merchant2)

    def authenticate_as_customer2(self):
        """Helper to authenticate as the second customer user."""
        self.client.force_authenticate(user=self.customer2)

    def create_payment_plan(self, merchant=None, customer=None, **kwargs):
        """Create a payment plan with installments."""
        merchant = merchant or self.merchant
        customer = customer or self.customer

        plan_data = {
            "total_amount": Decimal(kwargs.get("total_amount", "1000.00")),
            "start_date": kwargs.get("start_date", date.today() + timedelta(days=7)),
        }

        plan = PaymentPlan.objects.create(merchant=merchant, customer=customer, **plan_data)

        installment_count = kwargs.get("installments", 4)
        plan.generate_installments(count=installment_count)
        return plan

    def get_installment(self, plan=None, sequence=1):
        """Get a specific installment from a plan."""
        if plan is None:
            plan = self.create_payment_plan()
        return plan.installments.get(sequence=sequence)
