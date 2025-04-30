import { Box, Button, Card, CardContent, Chip, Container, Divider, Grid, Paper, Typography, Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { InstallmentRow, Inst } from "../components/molecules/InstallmentRow";
import PlanProgress from "../components/atoms/Progress";
import dayjs from "dayjs";
import { useAuth } from "../hooks/AuthContext";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentIcon from '@mui/icons-material/Payment';
import PendingIcon from '@mui/icons-material/Pending';

// Status code to display text mapping for plans
const PLAN_STATUS_MAP: Record<string, string> = {
  "P": "In Progress", // Show "In Progress" for plans (instead of "Pending")
  "D": "Paid",
  "L": "Late"
};

// Status code to chip color mapping
const STATUS_COLOR_MAP: Record<string, "success" | "warning" | "primary" | "error"> = {
  "P": "primary",
  "D": "success",
  "L": "error"
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans/").then(r => r.data),
  });

  const upcoming = plans.flatMap((p:any)=>p.installments)
                         .filter((i:Inst)=>i.status==="P") // Update to single-letter code
                         .sort((a,b)=>dayjs(a.due_date).unix()-dayjs(b.due_date).unix());

  const past = plans.flatMap((p:any)=>p.installments)
                    .filter((i:Inst)=>i.status !== "P"); // Update to single-letter code

  // Get the next payment date
  const nextPaymentDate = upcoming.length > 0 ? upcoming[0].due_date : null;

  // Calculate total amount to pay
  const totalOwed = upcoming.reduce((sum: number, inst: Inst) => sum + parseFloat(inst.amount), 0);

  // Calculate amount already paid
  const totalPaid = past.reduce((sum: number, inst: Inst) => sum + parseFloat(inst.amount), 0);

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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'primary.light', mr: 2 }}>
                  <CalendarTodayIcon color="primary" />
                </Box>
                <Typography variant="h6">Next Payment</Typography>
              </Box>
              <Typography variant="h5" fontWeight="500">
                {nextPaymentDate ? dayjs(nextPaymentDate).format('MMMM D, YYYY') : 'No upcoming payments'}
              </Typography>
              {nextPaymentDate && upcoming.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {upcoming[0].amount} SAR
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'success.light', mr: 2 }}>
                  <AccountBalanceWalletIcon color="success" />
                </Box>
                <Typography variant="h6">Total Paid</Typography>
              </Box>
              <Typography variant="h5" fontWeight="500">
                {totalPaid.toFixed(2)} SAR
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {past.length} installment{past.length !== 1 ? 's' : ''} paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: 'info.light', mr: 2 }}>
                  <PaymentIcon color="info" />
                </Box>
                <Typography variant="h6">Remaining</Typography>
              </Box>
              <Typography variant="h5" fontWeight="500">
                {totalOwed.toFixed(2)} SAR
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {upcoming.length} upcoming installment{upcoming.length !== 1 ? 's' : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom fontWeight="500">Your Payment Plans</Typography>

      {plans.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <PendingIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>No Payment Plans Yet</Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have any active payment plans at the moment.
          </Typography>
        </Paper>
      ) : (
        plans.map((plan:any) => (
          <Paper key={plan.id} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Plan #{plan.id} - {plan.total_amount} SAR</Typography>
              <Chip
                label={PLAN_STATUS_MAP[plan.status] || plan.status}
                color={STATUS_COLOR_MAP[plan.status] || "default"}
                variant="outlined"
              />
            </Box>

            <PlanProgress
              paid={plan.paid_installments || plan.installments.filter((i:Inst)=>i.status==="D").length}
              total={plan.total_installments || plan.installments.length}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Installments</Typography>
            {plan.installments.map((i:Inst) => (
              <InstallmentRow key={i.id} inst={i} />
            ))}
          </Paper>
        ))
      )}

      {upcoming.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 500 }}>Upcoming installments</Typography>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {upcoming.slice(0, 5).map((i: Inst) => (
              <InstallmentRow key={i.id} inst={i} />
            ))}
          </Paper>
        </>
      )}

      {past.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 500 }}>Payment History</Typography>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {past.slice(0, 5).map((i: Inst) => (
              <InstallmentRow key={i.id} inst={i} />
            ))}
          </Paper>
        </>
      )}
    </Container>
  );
}
