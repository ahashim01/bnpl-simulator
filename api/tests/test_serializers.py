from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase

from accounts.models import User
from api.serializers import (
    CustomerSerializer,
    InstallmentSerializer,
    PaymentPlanCreateSerializer,
    PaymentPlanReadSerializer,
)
from payments.models import Status

from .base import APIBaseTestCase


class CustomerSerializerTest(TestCase):
    """Tests for the CustomerSerializer."""

    @classmethod
    def setUpTestData(cls):
        cls.customer = User.objects.create_user(
            username="testcustomer",
            email="customer@test.com",
            password="password123",
            is_merchant=False,
        )
        cls.serializer = CustomerSerializer(instance=cls.customer)

    def test_contains_expected_fields(self):
        """Test that the serializer contains the expected fields."""
        data = self.serializer.data
        self.assertEqual(set(data.keys()), {"id", "username", "email"})

    def test_email_validation(self):
        """Test that the email field is properly validated."""
        # Valid email
        valid_data = {"email": "valid@example.com", "username": "validuser", "id": 1}
        serializer = CustomerSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())

        # Invalid email
        invalid_data = {"email": "invalid-email", "username": "invaliduser", "id": 1}
        serializer = CustomerSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_field_sanitization(self):
        """Test that text fields are properly sanitized."""
        # Create a user with HTML in the username
        user = User.objects.create_user(
            username="<script>alert('test');</script>user",
            email="script@test.com",
            password="password123",
            is_merchant=False,
        )

        serializer = CustomerSerializer(instance=user)
        data = serializer.data

        # HTML should be removed from the username
        self.assertNotIn("<script>", data["username"])
        self.assertIn("user", data["username"])


class InstallmentSerializerTest(APIBaseTestCase):
    """Tests for the InstallmentSerializer."""

    def setUp(self):
        super().setUp()
        self.plan = self.create_payment_plan()
        self.installment = self.get_installment(self.plan)
        self.serializer = InstallmentSerializer(instance=self.installment)

    def test_contains_expected_fields(self):
        """Test that the serializer contains the expected fields."""
        data = self.serializer.data
        self.assertEqual(set(data.keys()), {"id", "sequence", "due_date", "amount", "status"})

    def test_serialization(self):
        """Test that the serializer correctly serializes installment data."""
        data = self.serializer.data
        self.assertEqual(data["sequence"], self.installment.sequence)
        self.assertEqual(data["status"], self.installment.status)
        self.assertEqual(Decimal(data["amount"]), self.installment.amount.quantize(Decimal("0.01")))


class PaymentPlanCreateSerializerTest(APIBaseTestCase):
    """Tests for the PaymentPlanCreateSerializer."""

    def setUp(self):
        super().setUp()
        self.context = {"request": type("obj", (object,), {"user": self.merchant})}
        self.valid_data = {
            "total_amount": "1000.00",
            "start_date": date.today() + timedelta(days=7),
            "installments": 4,
            "customer_email": self.customer.email,
        }
        self.serializer = PaymentPlanCreateSerializer(data=self.valid_data, context=self.context)

    def test_serializer_with_valid_data(self):
        """Test that the serializer is valid with valid data."""
        self.assertTrue(self.serializer.is_valid())

    def test_minimum_installment_amount_validation(self):
        """Test that the serializer validates minimum installment amounts."""
        # Each installment would be $4, which is below the minimum of $5
        data = self.valid_data.copy()
        data["total_amount"] = "16.00"
        data["installments"] = 4

        serializer = PaymentPlanCreateSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertIn("below the minimum", str(serializer.errors["non_field_errors"][0]))

    def test_start_date_validation(self):
        """Test that the serializer validates the start_date is not too far in future."""
        data = self.valid_data.copy()
        data["start_date"] = date.today() + timedelta(days=366)  # More than a year

        serializer = PaymentPlanCreateSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertIn("more than a year", str(serializer.errors["non_field_errors"][0]))

    def test_customer_email_validation(self):
        """Test that the serializer validates the customer email."""
        # Test with non-existent email
        data = self.valid_data.copy()
        data["customer_email"] = "nonexistent@example.com"

        serializer = PaymentPlanCreateSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn("customer_email", serializer.errors)
        self.assertIn("No customer found", str(serializer.errors["customer_email"][0]))

        # Test with merchant email
        data = self.valid_data.copy()
        data["customer_email"] = self.merchant.email

        serializer = PaymentPlanCreateSerializer(data=data, context=self.context)
        self.assertFalse(serializer.is_valid())
        self.assertIn("customer_email", serializer.errors)
        self.assertIn("No customer found", str(serializer.errors["customer_email"][0]))

    def test_create_payment_plan(self):
        """Test that the serializer correctly creates a payment plan."""
        self.assertTrue(self.serializer.is_valid())
        plan = self.serializer.save()

        # Verify the plan was created correctly
        self.assertEqual(plan.merchant, self.merchant)
        self.assertEqual(plan.customer, self.customer)
        self.assertEqual(plan.total_amount, Decimal("1000.00"))

        # Verify installments were created
        self.assertEqual(plan.installments.count(), 4)

        # Verify each installment
        total_installment_amount = sum(i.amount for i in plan.installments.all())
        self.assertEqual(total_installment_amount, Decimal("1000.00"))


class PaymentPlanReadSerializerTest(APIBaseTestCase):
    """Tests for the PaymentPlanReadSerializer."""

    def setUp(self):
        super().setUp()
        self.plan = self.create_payment_plan()
        self.serializer = PaymentPlanReadSerializer(instance=self.plan)

    def test_contains_expected_fields(self):
        """Test that the serializer contains the expected fields."""
        data = self.serializer.data
        self.assertEqual(
            set(data.keys()),
            {
                "id",
                "total_amount",
                "status",
                "start_date",
                "customer",
                "merchant",
                "installments",
                "total_installments",
                "paid_installments",
            },
        )

    def test_nested_serializers(self):
        """Test that nested serializers are correctly used."""
        data = self.serializer.data

        # Check customer data
        self.assertEqual(data["customer"]["id"], self.customer.id)
        self.assertEqual(data["customer"]["username"], self.customer.username)
        self.assertEqual(data["customer"]["email"], self.customer.email)

        # Check merchant data
        self.assertEqual(data["merchant"]["id"], self.merchant.id)
        self.assertEqual(data["merchant"]["username"], self.merchant.username)
        self.assertEqual(data["merchant"]["email"], self.merchant.email)

        # Check installments data
        self.assertEqual(len(data["installments"]), 4)

    def test_calculated_fields(self):
        """Test that calculated fields return correct values."""
        data = self.serializer.data

        self.assertEqual(data["total_installments"], 4)
        self.assertEqual(data["paid_installments"], 0)

        # Mark an installment as paid
        installment = self.plan.installments.first()
        installment.status = Status.PAID
        installment.save()

        # Refresh the serializer to get updated data
        serializer = PaymentPlanReadSerializer(instance=self.plan)
        data = serializer.data

        self.assertEqual(data["paid_installments"], 1)
