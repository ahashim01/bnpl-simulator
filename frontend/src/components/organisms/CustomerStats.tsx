import { Grid } from "@mui/material";
import StatsCard from "../molecules/StatsCard";
import { Installment } from "../../types/api";
import { PaymentStatus } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatting";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentIcon from '@mui/icons-material/Payment';

interface CustomerStatsProps {
  installments: Installment[];
}

export default function CustomerStats({ installments }: CustomerStatsProps) {
  const upcoming = installments.filter(i => i.status === PaymentStatus.PENDING)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const past = installments.filter(i => i.status !== PaymentStatus.PENDING);

  // Get the next payment date
  const nextPaymentDate = upcoming.length > 0 ?
    new Date(upcoming[0].due_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) :
    "No upcoming payments";

  // Calculate total amount to pay
  const totalOwed = upcoming.reduce(
    (sum, inst) => sum + parseFloat(inst.amount), 0
  );

  // Calculate amount already paid
  const totalPaid = past.reduce(
    (sum, inst) => sum + parseFloat(inst.amount), 0
  );

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <StatsCard
          icon={<CalendarTodayIcon />}
          title="Next Payment"
          value={nextPaymentDate}
          subtitle={upcoming.length > 0 ? formatCurrency(upcoming[0].amount) : undefined}
          iconBgColor="primary.light"
          iconColor="primary.main"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <StatsCard
          icon={<AccountBalanceWalletIcon />}
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          subtitle={`${past.length} installment${past.length !== 1 ? 's' : ''} paid`}
          iconBgColor="success.light"
          iconColor="success.main"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <StatsCard
          icon={<PaymentIcon />}
          title="Remaining"
          value={formatCurrency(totalOwed)}
          subtitle={`${upcoming.length} upcoming installment${upcoming.length !== 1 ? 's' : ''}`}
          iconBgColor="info.light"
          iconColor="info.main"
        />
      </Grid>
    </Grid>
  );
}
