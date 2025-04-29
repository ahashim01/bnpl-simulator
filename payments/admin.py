from django.contrib import admin
from django.db.models import Count
from django.utils.translation import gettext_lazy as _

from .models import Installment, PaymentPlan


class InstallmentInline(admin.TabularInline):
    """Inline admin for Installments within a PaymentPlan."""

    model = Installment
    extra = 0
    fields = ("sequence", "amount", "due_date", "status", "paid_at")
    readonly_fields = ("sequence",)
    show_change_link = True
    can_delete = False
    max_num = 0  # Don't allow adding installments directly

    def has_add_permission(self, request, obj=None):
        return False  # Prevent adding installments through the admin


@admin.register(PaymentPlan)
class PaymentPlanAdmin(admin.ModelAdmin):
    """Admin interface for the PaymentPlan model with performance optimizations."""

    list_display = (
        "id",
        "merchant_username",
        "customer_username",
        "total_amount",
        "start_date",
        "status",
        "installment_count",
        "created_at",
    )
    list_filter = ("status", "start_date", "created_at")
    search_fields = ("merchant__username", "customer__username")
    date_hierarchy = "start_date"
    readonly_fields = ("created_at",)
    inlines = [InstallmentInline]

    fieldsets = (
        (_("Plan Details"), {"fields": ("merchant", "customer", "total_amount", "start_date", "status", "created_at")}),
    )

    # Optimize queryset by prefetching related data
    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("merchant", "customer")
            .annotate(installment_count=Count("installments"))
        )

    # Custom columns for better display
    def merchant_username(self, obj):
        return obj.merchant.username

    merchant_username.short_description = _("Merchant")
    merchant_username.admin_order_field = "merchant__username"

    def customer_username(self, obj):
        return obj.customer.username

    customer_username.short_description = _("Customer")
    customer_username.admin_order_field = "customer__username"

    def installment_count(self, obj):
        return getattr(obj, "installment_count", obj.installments.count())

    installment_count.short_description = _("Installments")
    installment_count.admin_order_field = "installment_count"


@admin.register(Installment)
class InstallmentAdmin(admin.ModelAdmin):
    """Admin interface for the Installment model with performance optimizations."""

    list_display = ("id", "plan_id", "customer_info", "sequence", "amount", "due_date", "status", "paid_at")
    list_filter = ("status", "due_date", "paid_at")
    search_fields = ("plan__id", "plan__customer__username")
    date_hierarchy = "due_date"
    ordering = ("plan", "sequence")

    fieldsets = (
        (_("Installment Details"), {"fields": ("plan", "sequence", "amount", "due_date", "status", "paid_at")}),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return ("plan", "sequence")
        return ()

    # Optimize queryset by prefetching related data
    def get_queryset(self, request):
        return super().get_queryset(request).select_related("plan", "plan__customer", "plan__merchant")

    # Custom column for better display
    def customer_info(self, obj):
        return obj.plan.customer.username

    customer_info.short_description = _("Customer")
    customer_info.admin_order_field = "plan__customer__username"

    # Redirect to payment plan after saving
    def response_post_save_change(self, request, obj):
        """Redirect to the parent payment plan after saving an installment."""
        return admin.ModelAdmin.response_post_save_change(self, request, obj)
