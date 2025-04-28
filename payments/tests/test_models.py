import datetime as dt
import decimal

import pytest

from accounts.models import User
from payments.models import PaymentPlan

decimal.getcontext().prec = 9  # avoid rounding surprises in tests


@pytest.mark.django_db
def test_split_rounding_exact_sum():
    merchant = User.objects.create(username="m1", is_merchant=True)
    customer = User.objects.create(username="u1")

    plan = PaymentPlan.objects.create(
        merchant=merchant,
        customer=customer,
        total_amount=decimal.Decimal("1000.00"),
        start_date=dt.date(2025, 6, 1),
    )
    plan.generate_installments(count=3)

    amounts = list(plan.installments.values_list("amount", flat=True))
    assert sum(amounts) == plan.total_amount
    # default rounding: 333.33 + 333.33 + 333.34 = 1000.00

    assert amounts == [
        decimal.Decimal("333.33"),
        decimal.Decimal("333.33"),
        decimal.Decimal("333.34"),
    ]
