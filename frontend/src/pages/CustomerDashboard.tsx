import { Box, Grid as MuiGrid, Typography, Fade } from "@mui/material";
import { useAuth } from "../hooks/AuthContext";
import { usePlans } from "../hooks/useQueries";
import DashboardLayout from "../components/layouts/DashboardLayout";
import CustomerStats from "../components/organisms/CustomerStats";
import UpcomingPaymentCard from "../components/organisms/UpcomingPaymentCard";
import PaymentCalendar from "../components/organisms/PaymentCalendar";
import PlanCard from "../components/molecules/PlanCard";
import LoadingFallback from "../components/molecules/LoadingFallback";
import ErrorFallback from "../components/molecules/ErrorFallback";
import { Installment } from "../types/api";
import { PaymentStatus } from "../utils/constants";

// Create a properly typed wrapper for Grid
const Grid = MuiGrid as React.ComponentType<any>;

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: plans = [], isLoading, error, refetch } = usePlans();

  // Extract all installments from all plans
  const allInstallments: Installment[] = plans.flatMap(plan => plan.installments);

  // Get the plan with the next upcoming payment
  const plansWithPending = plans.filter(plan =>
    plan.installments.some(inst => inst.status === PaymentStatus.PENDING)
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingFallback message="Loading your payment plans..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorFallback error={error} resetError={() => refetch()} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500">
          Customer Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back{user?.username ? `, ${user.username}` : ''}! Here's an overview of your payment plans.
        </Typography>
      </Box>

      <Fade in={!isLoading} timeout={500}>
        <div>
          {/* Payment Summary Cards */}
          <CustomerStats installments={allInstallments} />

          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} md={7}>
              {/* Payment Calendar */}
              <PaymentCalendar installments={allInstallments} />

              {/* Your Payment Plans */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="500">
                  Your Payment Plans
                </Typography>

                {plans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              {/* Upcoming Payments */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="500">
                  Upcoming Payments
                </Typography>

                {plansWithPending.length > 0 ? (
                  plansWithPending.map(plan => (
                    <UpcomingPaymentCard key={plan.id} plan={plan} />
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      You have no upcoming payments. All your installments are paid!
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </div>
      </Fade>
    </DashboardLayout>
  );
}
