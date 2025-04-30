import { Container, Paper, Typography, Box, Divider, Grid, Card, CardContent, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { InstallmentRow, Inst } from "../components/molecules/InstallmentRow";
import PlanProgress from "../components/atoms/Progress";
import dayjs from "dayjs";

export default function CustomerDashboard() {
  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans/").then(r => r.data),
  });

  const upcoming = plans.flatMap((p:any)=>p.installments)
                         .filter((i:Inst)=>i.status==="PENDING")
                         .sort((a,b)=>dayjs(a.due_date).unix()-dayjs(b.due_date).unix());

  const past = plans.flatMap((p:any)=>p.installments)
                    .filter((i:Inst)=>i.status!=="PENDING");

  // Get the next payment date
  const nextPaymentDate = upcoming.length > 0 ? upcoming[0].due_date : null;

  // Calculate total amount to pay
  const totalOwed = upcoming.reduce((sum: number, inst: Inst) => sum + parseFloat(inst.amount), 0);

  // Calculate amount already paid
  const totalPaid = past.reduce((sum: number, inst: Inst) => sum + parseFloat(inst.amount), 0);

  return (
    <Container sx={{ py:4 }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Active Payment Plans</Typography>
              <Typography variant="h4">{plans.filter((p:any)=>p.status==="PENDING").length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Amount Paid</Typography>
              <Typography variant="h4">{totalPaid.toFixed(2)} SAR</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Remaining to Pay</Typography>
              <Typography variant="h4">{totalOwed.toFixed(2)} SAR</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Next payment notification */}
      {nextPaymentDate && (
        <Paper sx={{ p:3, mb:4, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="h6">
            Your next payment is due on {nextPaymentDate}
          </Typography>
          <Typography variant="body1">
            Amount: {upcoming[0].amount} SAR
          </Typography>
        </Paper>
      )}

      {/* Payment Plans Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>My Payment Plans</Typography>
      {plans.map((plan: any) => (
        <Paper key={plan.id} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Plan #{plan.id} - {plan.total_amount} SAR</Typography>
            <Chip
              label={plan.status}
              color={plan.status === 'PAID' ? 'success' : 'primary'}
              variant="outlined"
            />
          </Box>

          <PlanProgress
            paid={plan.installments.filter((i:Inst)=>i.status==="PAID").length}
            total={plan.installments.length}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>Installments</Typography>
          {plan.installments.map((i:Inst) => (
            <InstallmentRow key={i.id} inst={i} />
          ))}
        </Paper>
      ))}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Upcoming installments</Typography>
      <Paper sx={{ p:2, mb:3 }}>
        {upcoming.length===0 ? (
          <Typography variant="body1">No upcoming payments. You're all set!</Typography>
        ) : (
          upcoming.map(i => <InstallmentRow key={i.id} inst={i} />)
        )}
      </Paper>

      <Typography variant="h5" gutterBottom>Payment History</Typography>
      <Paper sx={{ p:2 }}>
        {past.length===0 ? (
          <Typography variant="body1">No payment history yet.</Typography>
        ) : (
          past.map(i => <InstallmentRow key={i.id} inst={i} />)
        )}
      </Paper>
    </Container>
  );
}
