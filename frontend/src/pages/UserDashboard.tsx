import { Container, Typography, Card, CardContent, Box, Chip, Button, Grid, LinearProgress, Divider } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { InstallmentRow } from "../components/molecules/InstallmentRow";
import { PaymentPlan, Installment } from "../types/api";
import { formatCurrency, formatDate } from "../utils/formatting";
import { PaymentStatus, STATUS_COLORS, STATUS_LABELS } from "../utils/constants";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans/").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>My Payment Plans</Typography>
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <LinearProgress sx={{ width: "50%" }} />
        </Box>
      </Container>
    );
  }

  // Find next upcoming installment
  const upcomingInstallments = plans
    ?.flatMap((plan: PaymentPlan) =>
      plan.installments
        .filter((inst: Installment) => inst.status === PaymentStatus.PENDING)
        .map((inst: Installment) => ({...inst, plan}))
    )
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const nextInstallment = upcomingInstallments?.[0];

  return (
    <Container sx={{ py: 4 }}>
      {/* Upcoming Payments Section */}
      {nextInstallment && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Upcoming Payments</Typography>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6">
                  Plan #{nextInstallment.plan.id}
                </Typography>
                <Chip
                  label={STATUS_LABELS[nextInstallment.status]}
                  color={STATUS_COLORS[nextInstallment.status]}
                  size="small"
                />
              </Box>

              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Total Amount: {formatCurrency(nextInstallment.plan.total_amount)}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={(nextInstallment.plan.paid_installments / nextInstallment.plan.total_installments) * 100}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {nextInstallment.plan.paid_installments} of {nextInstallment.plan.total_installments} installments paid
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="subtitle1">
                  Due in {Math.ceil((new Date(nextInstallment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </Typography>
              </Box>

              <Typography variant="h5" sx={{ mb: 1 }}>
                {formatCurrency(nextInstallment.amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Due date: {formatDate(nextInstallment.due_date)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Merchant:</Typography>
                <Typography variant="body2">{nextInstallment.plan.merchant?.username || "Unknown Merchant"}</Typography>

                <Typography variant="body2" color="text.secondary">Start Date:</Typography>
                <Typography variant="body2">{formatDate(nextInstallment.plan.start_date)}</Typography>

                <Typography variant="body2" color="text.secondary">Installment:</Typography>
                <Typography variant="body2">{nextInstallment.sequence} of {nextInstallment.plan.total_installments}</Typography>

                <Typography variant="body2" color="text.secondary">Paid:</Typography>
                <Typography variant="body2">
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircleOutlineIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                    {nextInstallment.plan.paid_installments} installments paid
                    ({formatCurrency((parseFloat(nextInstallment.plan.total_amount) * nextInstallment.plan.paid_installments / nextInstallment.plan.total_installments).toString())})
                  </Box>
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate(`/plan/${nextInstallment.plan.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* All Payment Plans Section */}
      <Typography variant="h4" sx={{ mb: 3 }}>Your Payment Plans</Typography>
      <Grid container spacing={3}>
        {plans?.map((plan: PaymentPlan) => (
          <Grid item xs={12} key={plan.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
                      Plan #{plan.id}
                      {plan.status === PaymentStatus.PAID && (
                        <Box component="span" sx={{ ml: 1 }}>
                          <Chip label="Paid" color="success" size="small" />
                        </Box>
                      )}
                    </Typography>
                    <Typography variant="h5">{formatCurrency(plan.total_amount)}</Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" component="div">
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Merchant:</Typography>
                      {plan.merchant?.username || "Unknown Merchant"}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Started:</Typography>
                      {formatDate(plan.start_date)}
                    </Box>
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={(plan.paid_installments / plan.total_installments) * 100}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.paid_installments}/{plan.total_installments} installments paid
                </Typography>

                <Button
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={() => navigate(`/plan/${plan.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Only show installments if user clicks "View Details" for better organization */}
          </Grid>
        ))}
      </Grid>

      {plans?.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", my: 4 }}>
          You don't have any payment plans yet.
        </Typography>
      )}
    </Container>
  );
}
