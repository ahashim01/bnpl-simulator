import { Box, Container, Typography, Paper } from "@mui/material";
import PendingIcon from '@mui/icons-material/Pending';
import { usePlans } from "../hooks/useQueries";
import PlanCard from "../components/molecules/PlanCard";
import CustomerStats from "../components/organisms/CustomerStats";
import UpcomingPayments from "../components/organisms/UpcomingPayments";
import PaymentHistory from "../components/organisms/PaymentHistory";
import LoadingFallback from "../components/molecules/LoadingFallback";
import ErrorFallback from "../components/molecules/ErrorFallback";
import { useAuth } from "../hooks/AuthContext";
import { Installment } from "../types/api";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: plans = [], isLoading, error, refetch } = usePlans();

  // Extract all installments from all plans
  const allInstallments: Installment[] = plans.flatMap(plan => plan.installments);

  if (isLoading) {
    return <LoadingFallback message="Loading your payment plans..." />;
  }

  if (error) {
    return <ErrorFallback error={error as Error} resetError={() => refetch()} />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          Customer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back{user?.username ? `, ${user.username}` : ''}! Here's an overview of your payment plans.
        </Typography>
      </Box>

      {/* Payment Summary Cards */}
      <CustomerStats installments={allInstallments} />

      <Typography variant="h5" gutterBottom fontWeight="500">
        Your Payment Plans
      </Typography>

      {plans.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <PendingIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Payment Plans Yet</Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have any active payment plans at the moment.
          </Typography>
        </Paper>
      ) : (
        plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))
      )}

      {/* Upcoming Payments Section */}
      <UpcomingPayments installments={allInstallments} />

      {/* Payment History Section */}
      <PaymentHistory installments={allInstallments} />
    </Container>
  );
}
