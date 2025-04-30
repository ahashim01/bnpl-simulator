from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsMerchantOrOwner(BasePermission):
    """
    GET:
        • merchant sees own created plans
        • customer sees own plans
    POST:
        • only merchants may create
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        # only merchants can POST (create)
        return request.user.is_authenticated and request.user.is_merchant

    def has_object_permission(self, request, view, obj):
        if request.user.is_merchant:
            return obj.merchant_id == request.user.id
        return obj.customer_id == request.user.id


class CanPayInstallment(BasePermission):
    """
    Custom permission to allow customers to pay their own installments.
    """

    def has_permission(self, request, view):
        # Anyone authenticated can access
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # For 'pay' action, only the customer of the plan should be allowed
        if view.action == "pay":
            # obj is an Installment, so we need to check against the plan's customer
            return obj.plan.customer_id == request.user.id

        # For other actions, fall back to the standard permission
        if request.user.is_merchant:
            return obj.plan.merchant_id == request.user.id
        return obj.plan.customer_id == request.user.id
