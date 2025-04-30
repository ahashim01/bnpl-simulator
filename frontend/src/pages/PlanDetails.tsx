import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import { formatCurrency } from "../utils/formatting";
import { PaymentStatus, PLAN_STATUS_LABELS, STATUS_COLORS } from "../utils/constants";
import DashboardLayout from "../components/layouts/DashboardLayout";
import LoadingFallback from "../components/molecules/LoadingFallback";
import ErrorFallback from "../components/molecules/ErrorFallback";
import { InstallmentRow } from "../components/molecules/InstallmentRow";
import api from "../services/api";
import { PaymentPlan } from "../types/api";
import PlanProgress from "../components/atoms/Progress";

export default function PlanDetails() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch plan details
  const {
    data: plan,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => api.getPlan(planId as string),
    enabled: !!planId
  });

  // If plan is not found, navigate to the plans page
  useEffect(() => {
    if (error) {
      console.error("Error fetching plan:", error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingFallback message="Loading payment plan details..." />
      </DashboardLayout>
    );
  }

  if (error || !plan) {
    return (
      <DashboardLayout>
        <ErrorFallback
          error={error as Error || new Error("Plan not found")}
          resetError={() => refetch()}
        />
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        {/* Header with back button and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ mr: 1 }}
              color="primary"
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="500">
                Plan #{plan.id}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Created on {new Date(plan.start_date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Tooltip title="Refresh data">
              <IconButton onClick={() => refetch()} color="primary" sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Main content */}
        <Grid container spacing={3}>
          {/* Plan details card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Plan Details
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography color="text.secondary">Total Amount:</Typography>
                  <Typography fontWeight="500">{formatCurrency(plan.total_amount)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography color="text.secondary">Status:</Typography>
                  <Chip
                    label={PLAN_STATUS_LABELS[plan.status as PaymentStatus] || plan.status}
                    color={STATUS_COLORS[plan.status as PaymentStatus] || "default"}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography color="text.secondary">Created:</Typography>
                  <Typography>{new Date(plan.start_date).toLocaleDateString()}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography color="text.secondary">Installments:</Typography>
                  <Typography>{plan.total_installments}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography color="text.secondary">Paid:</Typography>
                  <Typography>{plan.paid_installments} of {plan.total_installments}</Typography>
                </Box>

                <Box sx={{ mb: 2, mt: 3 }}>
                  {plan.customer && (
                    <Box sx={{ mb: 2, mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Customer Information
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Username:</Typography>
                        <Typography>{plan.customer.username}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Email:</Typography>
                        <Typography>{plan.customer.email}</Typography>
                      </Box>
                    </Box>
                  )}

                  {plan.merchant && (
                    <Box sx={{ mb: 2, mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Merchant Information
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Name:</Typography>
                        <Typography>{plan.merchant.username}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Email:</Typography>
                        <Typography>{plan.merchant.email}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Progress
                  </Typography>
                  <PlanProgress
                    paid={plan.paid_installments}
                    total={plan.total_installments}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Installments table */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Installments
              </Typography>

              {plan.installments.map((installment, idx) => (
                <InstallmentRow
                  key={installment.id}
                  inst={installment}
                  delay={idx * 0.05}
                />
              ))}

              {plan.installments.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No installments found for this payment plan
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
