import { Grid } from "@mui/material";
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

interface MerchantStatsProps {
  plans: PaymentPlan[];
}

export default function MerchantStats({ plans }: MerchantStatsProps) {
  // Calculate analytics
  const totalRevenue = plans.reduce((a, p) => a + parseFloat(p.total_amount), 0);

  // Updated revenue calculation to include partial payments
  const paidRevenue = plans.reduce((total, plan) => {
    if (plan.status === PaymentStatus.PAID) {
      // If the entire plan is paid, add the full amount
      return total + parseFloat(plan.total_amount);
    } else {
      // For plans not fully paid, sum up the paid installments
      const paidInstallmentsAmount = plan.installments
        .filter(installment => installment.status === PaymentStatus.PAID)
        .reduce((sum, installment) => sum + parseFloat(installment.amount), 0);
      return total + paidInstallmentsAmount;
    }
  }, 0);

  const pendingRevenue = totalRevenue - paidRevenue;

  // Count plans by status
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.status === PaymentStatus.PENDING).length;
  const completedPlans = plans.filter(p => p.status === PaymentStatus.PAID).length;

  // Calculate success rate
  const successRate = totalPlans ? ((completedPlans / totalPlans) * 100).toFixed(1) : "0";

  // Get overdue installments
  const overdueInstallments = plans.flatMap(p =>
    p.installments.filter(i => i.status === PaymentStatus.LATE)
  ).length;

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={3}>
          <StatsCard
            icon={<CurrencyExchangeIcon />}
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            iconBgColor="primary.light"
            iconColor="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard
            icon={<AccountBalanceIcon />}
            title="Collected Revenue"
            value={formatCurrency(paidRevenue)}
            iconBgColor="success.light"
            iconColor="success.main"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard
            icon={<PendingIcon />}
            title="Pending Revenue"
            value={formatCurrency(pendingRevenue)}
            iconBgColor="info.light"
            iconColor="info.main"
          />
        </Grid>
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={4}>
          <StatsCard
            icon={<DoneIcon />}
            title="Total Plans"
            value={totalPlans.toString()}
            iconBgColor="primary.light"
            iconColor="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            icon={<PendingIcon />}
            title="Active Plans"
            value={activePlans.toString()}
            iconBgColor="info.light"
            iconColor="info.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
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
