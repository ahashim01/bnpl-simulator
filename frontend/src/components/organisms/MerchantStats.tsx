import { Grid as MuiGrid } from "@mui/material";
import StatsCard from "../molecules/StatsCard";
import { PaymentPlan } from "../../types/api";
import { PaymentStatus } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatting";
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PendingIcon from '@mui/icons-material/Pending';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DoneIcon from '@mui/icons-material/Done';
import WarningIcon from '@mui/icons-material/Warning';

// Create a properly typed wrapper for Grid item
const Grid = MuiGrid as React.ComponentType<any>;

interface MerchantStatsProps {
  plans: PaymentPlan[];
}

export default function MerchantStats({ plans }: Readonly<MerchantStatsProps>) {
  // Calculate merchant statistics
  const totalPlans = plans.length;

  // Active plans are those in PENDING status
  const activePlans = plans.filter(
    plan => plan.status === PaymentStatus.PENDING
  ).length;

  const totalRevenue = plans.reduce(
    (sum, plan) => sum + parseFloat(plan.total_amount),
    0
  );

  const paidRevenue = plans.reduce((sum, plan) => {
    return sum + plan.installments
      .filter(inst => inst.status === PaymentStatus.PAID)
      .reduce((instSum, inst) => instSum + parseFloat(inst.amount), 0);
  }, 0);

  const pendingRevenue = totalRevenue - paidRevenue;

  const totalInstallments = plans.reduce(
    (sum, plan) => sum + plan.installments.length,
    0
  );

  const paidInstallments = plans.reduce(
    (sum, plan) => sum + plan.paid_installments,
    0
  );

  // Calculate total installments that are not in the future (due or already paid)
  const currentDate = new Date();

  const dueInstallments = plans.reduce(
    (sum, plan) => sum + plan.installments.filter(
      inst => new Date(inst.due_date) <= currentDate
    ).length,
    0
  );

  // Success rate should be based on installments that are actually due, not future ones
  const successRate = dueInstallments > 0
    ? Math.round((paidInstallments / dueInstallments) * 100)
    : 100; // If no installments are due yet, success rate is 100%

  // Overdue installments are those with LATE status
  const overdueInstallments = plans.reduce(
    (sum, plan) => sum + plan.installments.filter(
      inst => inst.status === PaymentStatus.LATE
    ).length,
    0
  );

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<CurrencyExchangeIcon />}
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            iconBgColor="primary.light"
            iconColor="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<AccountBalanceIcon />}
            title="Collected Revenue"
            value={formatCurrency(paidRevenue)}
            iconBgColor="success.light"
            iconColor="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<PendingIcon />}
            title="Pending Revenue"
            value={formatCurrency(pendingRevenue)}
            iconBgColor="info.light"
            iconColor="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<TrendingUpIcon />}
            title="Success Rate"
            value={`${successRate}%`}
            iconBgColor="success.light"
            iconColor="success.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard
            icon={<DoneIcon />}
            title="Total Plans"
            value={totalPlans.toString()}
            iconBgColor="primary.light"
            iconColor="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            icon={<PendingIcon />}
            title="Active Plans"
            value={activePlans.toString()}
            iconBgColor="info.light"
            iconColor="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard
            icon={<WarningIcon />}
            title="Overdue Installments"
            value={overdueInstallments.toString()}
            iconBgColor="error.light"
            iconColor="error.main"
          />
        </Grid>
      </Grid>
    </>
  );
}
