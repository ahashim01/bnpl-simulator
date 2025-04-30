from django.test import RequestFactory

from api.permissions import CanPayInstallment, IsMerchantOrOwner

from .base import APIBaseTestCase


class MockView:
    """Mock view for testing permissions."""

    def __init__(self, action=None):
        self.action = action


class IsMerchantOrOwnerTest(APIBaseTestCase):
    """Tests for the IsMerchantOrOwner permission class."""

    def setUp(self):
        super().setUp()
        self.factory = RequestFactory()
        self.permission = IsMerchantOrOwner()
        self.plan = self.create_payment_plan()

    def test_unauthenticated_safe_method(self):
        """Test that unauthenticated users can access with safe methods."""
        request = self.factory.get("/")
        request.user = self.create_anonymous_user()

        # GET is a safe method, should return True regardless of authentication
        self.assertTrue(self.permission.has_permission(request, None))

    def test_unauthenticated_unsafe_method(self):
        """Test that unauthenticated users cannot access with unsafe methods."""
        request = self.factory.post("/")
        request.user = self.create_anonymous_user()

        # POST is not a safe method, should return False for unauthenticated
        self.assertFalse(self.permission.has_permission(request, None))

    def test_merchant_create_permission(self):
        """Test that merchants can create plans."""
        request = self.factory.post("/")
        request.user = self.merchant

        self.assertTrue(self.permission.has_permission(request, None))

    def test_customer_create_permission(self):
        """Test that customers cannot create plans."""
        request = self.factory.post("/")
        request.user = self.customer

        self.assertFalse(self.permission.has_permission(request, None))

    def test_merchant_object_permission_own_plan(self):
        """Test that merchants can access their own plans."""
        request = self.factory.get("/")
        request.user = self.merchant

        self.assertTrue(self.permission.has_object_permission(request, None, self.plan))

    def test_merchant_object_permission_others_plan(self):
        """Test that merchants cannot access other merchants' plans."""
        request = self.factory.get("/")
        request.user = self.merchant2

        self.assertFalse(self.permission.has_object_permission(request, None, self.plan))

    def test_customer_object_permission_own_plan(self):
        """Test that customers can access their own plans."""
        request = self.factory.get("/")
        request.user = self.customer

        self.assertTrue(self.permission.has_object_permission(request, None, self.plan))

    def test_customer_object_permission_others_plan(self):
        """Test that customers cannot access other customers' plans."""
        request = self.factory.get("/")
        request.user = self.customer2

        self.assertFalse(self.permission.has_object_permission(request, None, self.plan))

    def create_anonymous_user(self):
        """Create an anonymous user for testing."""
        return type("AnonymousUser", (object,), {"is_authenticated": False, "is_merchant": False})


class CanPayInstallmentTest(APIBaseTestCase):
    """Tests for the CanPayInstallment permission class."""

    def setUp(self):
        super().setUp()
        self.factory = RequestFactory()
        self.permission = CanPayInstallment()
        self.plan = self.create_payment_plan()
        self.installment = self.get_installment(self.plan)

    def test_unauthenticated_permission(self):
        """Test that unauthenticated users cannot access."""
        request = self.factory.get("/")
        request.user = self.create_anonymous_user()

        self.assertFalse(self.permission.has_permission(request, None))

    def test_authenticated_permission(self):
        """Test that authenticated users can access."""
        request = self.factory.get("/")
        request.user = self.customer

        self.assertTrue(self.permission.has_permission(request, None))

    def test_customer_pay_own_installment(self):
        """Test that customers can pay their own installments."""
        request = self.factory.post("/")
        request.user = self.customer
        view = MockView(action="pay")

        self.assertTrue(self.permission.has_object_permission(request, view, self.installment))

    def test_customer_pay_others_installment(self):
        """Test that customers cannot pay others' installments."""
        request = self.factory.post("/")
        request.user = self.customer2
        view = MockView(action="pay")

        self.assertFalse(self.permission.has_object_permission(request, view, self.installment))

    def test_merchant_pay_installment(self):
        """Test that merchants cannot pay installments."""
        request = self.factory.post("/")
        request.user = self.merchant
        view = MockView(action="pay")

        self.assertFalse(self.permission.has_object_permission(request, view, self.installment))

    def test_merchant_view_own_installment(self):
        """Test that merchants can view installments from their plans."""
        request = self.factory.get("/")
        request.user = self.merchant
        view = MockView(action="retrieve")

        self.assertTrue(self.permission.has_object_permission(request, view, self.installment))

    def test_merchant_view_others_installment(self):
        """Test that merchants cannot view installments from other merchants' plans."""
        request = self.factory.get("/")
        request.user = self.merchant2
        view = MockView(action="retrieve")

        self.assertFalse(self.permission.has_object_permission(request, view, self.installment))

    def create_anonymous_user(self):
        """Create an anonymous user for testing."""
        return type("AnonymousUser", (object,), {"is_authenticated": False, "is_merchant": False})
