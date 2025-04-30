from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from accounts.models import User
from api.views import get_cache_key
from payments.models import PaymentPlan, Status

from .base import APIBaseTestCase


class RegisterViewTest(APIBaseTestCase):
    """Tests for the RegisterView."""

    def setUp(self):
        super().setUp()
        self.url = reverse("register")
        self.valid_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "StrongP@ssw0rd!",
            "first_name": "New",
            "last_name": "User",
            "is_merchant": False,
        }

    def test_register_user_success(self):
        """Test user registration with valid data."""
        response = self.client.post(self.url, self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify the user was created
        user_exists = User.objects.filter(username="newuser").exists()
        self.assertTrue(user_exists)

    def test_register_user_with_existing_email(self):
        """Test user registration with an existing email."""
        data = self.valid_data.copy()
        data["email"] = self.customer.email  # Use an existing email

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_user_with_weak_password(self):
        """Test user registration with a weak password."""
        data = self.valid_data.copy()
        data["password"] = "password"  # Simple password

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_register_merchant(self):
        """Test merchant registration."""
        data = self.valid_data.copy()
        data["is_merchant"] = True
        data["email"] = "newmerchant@example.com"
        data["username"] = "newmerchant"

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify the merchant was created
        merchant = User.objects.get(username="newmerchant")
        self.assertTrue(merchant.is_merchant)


class CustomersWithPlansViewTest(APIBaseTestCase):
    """Tests for the CustomersWithPlansView."""

    def setUp(self):
        super().setUp()
        self.url = reverse("customers-with-plans")

        # Create a plan to establish connection between merchant and customer
        self.plan = self.create_payment_plan()

        # clear the cache before each test
        cache.clear()

    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access the endpoint."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_merchant_can_view_customers_with_plans(self):
        """Test that merchants can view their customers with plans."""
        self.authenticate_as_merchant()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should include customer with a plan
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["username"], self.customer.username)

    def test_customer_cannot_access(self):
        """Test that customers cannot access this endpoint."""
        self.authenticate_as_customer()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Customer should see empty array
        self.assertEqual(len(response.data), 0)

    def test_merchant_sees_only_own_customers(self):
        """Test that merchants only see customers with their plans."""
        # Create plan for merchant2 and customer2
        self.create_payment_plan(merchant=self.merchant2, customer=self.customer2)

        self.authenticate_as_merchant()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should only include customers of this merchant
        self.assertEqual(len(response.data), 1)
        usernames = [c["username"] for c in response.data]
        self.assertIn(self.customer.username, usernames)
        self.assertNotIn(self.customer2.username, usernames)


class CustomerListViewTest(APIBaseTestCase):
    """Tests for the CustomerListView."""

    def setUp(self):
        super().setUp()
        self.url = reverse("customer-list")
        # Clear the cache before each test
        cache.clear()

    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access the endpoint."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_merchant_can_view_all_customers(self):
        """Test that merchants can view all customers."""
        self.authenticate_as_merchant()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should include all customers
        self.assertEqual(len(response.data), 2)
        usernames = [c["username"] for c in response.data]
        self.assertIn(self.customer.username, usernames)
        self.assertIn(self.customer2.username, usernames)

    def test_customer_cannot_view_customers(self):
        """Test that customers cannot view the customer list."""
        self.authenticate_as_customer()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)  # Empty response for customers


class PaymentPlanViewSetTest(APIBaseTestCase):
    """Tests for the PaymentPlanViewSet."""

    def setUp(self):
        super().setUp()
        self.list_url = reverse("plans-list")

        # Create a plan for testing
        self.plan = self.create_payment_plan()
        self.detail_url = reverse("plans-detail", args=[self.plan.id])

        # Create plan for another merchant to test permissions
        self.other_merchant_plan = self.create_payment_plan(merchant=self.merchant2, customer=self.customer2)
        self.other_plan_url = reverse("plans-detail", args=[self.other_merchant_plan.id])

    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access the endpoints."""
        # Cannot list plans
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Cannot view plan details
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Cannot create plans
        response = self.client.post(self.list_url, self.plan_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_merchant_can_create_plan(self):
        """Test that merchants can create payment plans."""
        self.authenticate_as_merchant()

        response = self.client.post(self.list_url, self.plan_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify plan was created with installments
        plan_id = response.data["id"]
        plan = PaymentPlan.objects.get(id=plan_id)
        self.assertEqual(plan.installments.count(), 4)

    def test_customer_cannot_create_plan(self):
        """Test that customers cannot create payment plans."""
        self.authenticate_as_customer()

        response = self.client.post(self.list_url, self.plan_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_merchant_can_list_own_plans(self):
        """Test that merchants can list their own plans."""
        self.authenticate_as_merchant()

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should only include this merchant's plans
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.plan.id)

    def test_customer_can_list_own_plans(self):
        """Test that customers can list their own plans."""
        self.authenticate_as_customer()

        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should only include this customer's plans
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.plan.id)

    def test_merchant_can_view_own_plan_details(self):
        """Test that merchants can view their own plan details."""
        self.authenticate_as_merchant()

        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.plan.id)

    def test_merchant_cannot_view_other_merchant_plan(self):
        """Test that merchants cannot view plans from other merchants."""
        self.authenticate_as_merchant()

        response = self.client.get(self.other_plan_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_customer_can_view_own_plan_details(self):
        """Test that customers can view their own plan details."""
        self.authenticate_as_customer()

        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.plan.id)

    def test_customer_cannot_view_other_customer_plan(self):
        """Test that customers cannot view plans from other customers."""
        self.authenticate_as_customer()

        response = self.client.get(self.other_plan_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch("api.views.cache.get")
    @patch("api.views.cache.set")
    def test_caching_behavior(self, mock_cache_set, mock_cache_get):
        """Test that plans are correctly cached and retrieved."""
        # Mock cache to return None first (cache miss), then a queryset (cache hit)
        mock_cache_get.return_value = None

        with patch("rest_framework.throttling.SimpleRateThrottle.get_cache_key") as mock_throttle_get_cache_key:
            mock_throttle_get_cache_key.return_value = "test-throttle-key"

            with patch("rest_framework.throttling.SimpleRateThrottle.cache") as mock_throttle_cache:
                mock_throttle_cache.get.return_value = []  # Return empty list instead of None

                # First request - should try to get from cache, miss, then set cache
                self.authenticate_as_merchant()
                response1 = self.client.get(self.list_url)

                # Assert cache was checked
                mock_cache_get.assert_called_once()

                # Assert cache was set with appropriate data
                mock_cache_set.assert_called_once()

                # Reset mocks for second request
                mock_cache_get.reset_mock()
                mock_cache_set.reset_mock()

                # Mock cache hit
                mock_cache_get.return_value = PaymentPlan.objects.filter(id=self.plan.id)

                # Second request - should get from cache
                response2 = self.client.get(self.list_url)

                # Assert cache was checked
                mock_cache_get.assert_called_once()

                # Assert cache was not set (because we got a hit)
                mock_cache_set.assert_not_called()


class InstallmentPayViewTest(APIBaseTestCase):
    """Tests for the InstallmentPayView."""

    def setUp(self):
        super().setUp()
        self.plan = self.create_payment_plan()
        self.installment = self.get_installment(self.plan)
        self.pay_url = reverse("installments-pay", args=[self.installment.id])

    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access the endpoint."""
        response = self.client.post(self.pay_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_customer_can_pay_own_installment(self):
        """Test that customers can pay their own installments."""
        self.authenticate_as_customer()

        response = self.client.post(self.pay_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the installment is marked as paid
        self.installment.refresh_from_db()
        self.assertEqual(self.installment.status, Status.PAID)
        self.assertIsNotNone(self.installment.paid_at)

    def test_customer_cannot_pay_others_installment(self):
        """Test that customers cannot pay installments for others."""
        # Create a plan for customer2
        other_plan = self.create_payment_plan(merchant=self.merchant, customer=self.customer2)
        other_installment = self.get_installment(other_plan)
        other_pay_url = reverse("installments-pay", args=[other_installment.id])

        self.authenticate_as_customer()

        response = self.client.post(other_pay_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Verify the installment is still unpaid
        other_installment.refresh_from_db()
        self.assertEqual(other_installment.status, Status.PENDING)

    def test_merchant_cannot_pay_installment(self):
        """Test that merchants cannot pay installments."""
        self.authenticate_as_merchant()

        response = self.client.post(self.pay_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Verify the installment is still unpaid
        self.installment.refresh_from_db()
        self.assertEqual(self.installment.status, Status.PENDING)

    def test_pay_already_paid_installment(self):
        """Test that paying an already paid installment returns an error."""
        # Mark the installment as paid
        self.installment.status = Status.PAID
        self.installment.paid_at = timezone.now()
        self.installment.save()

        self.authenticate_as_customer()

        response = self.client.post(self.pay_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)
        self.assertEqual(response.data["detail"], "Already paid.")

    def test_plan_status_updates_when_all_paid(self):
        """Test that the plan status updates when all installments are paid."""
        # Mark all other installments as paid except one
        for i, installment in enumerate(self.plan.installments.all()):
            if i > 0:  # Skip the first one
                installment.status = Status.PAID
                installment.paid_at = timezone.now()
                installment.save()

        self.authenticate_as_customer()

        # Pay the last unpaid installment
        response = self.client.post(self.pay_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the plan is now marked as paid
        self.plan.refresh_from_db()
        self.assertEqual(self.plan.status, Status.PAID)

    @patch("api.views.cache.delete")
    def test_cache_invalidation_after_payment(self, mock_cache_delete):
        """Test that cache is invalidated after a payment is made."""
        self.authenticate_as_customer()

        response = self.client.post(self.pay_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Cache should be invalidated twice - once for customer, once for merchant
        self.assertEqual(mock_cache_delete.call_count, 2)


class GetCacheKeyTest(TestCase):
    """Tests for the get_cache_key function."""

    def test_default_prefix(self):
        """Test get_cache_key with default prefix."""
        key = get_cache_key(1)
        self.assertEqual(key, "plans:1")

    def test_custom_prefix(self):
        """Test get_cache_key with custom prefix."""
        key = get_cache_key(1, prefix="custom")
        self.assertEqual(key, "custom:1")
