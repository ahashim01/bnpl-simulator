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
