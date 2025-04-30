import { useState } from "react";
import {
  Box,
  Grid as MuiGrid,
  Typography,
  Button,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { usePlans } from "../hooks/useQueries";
import DashboardLayout from "../components/layouts/DashboardLayout";
import MerchantStats from "../components/organisms/MerchantStats";
import CreatePlanDialog from "../components/organisms/CreatePlanDialog";
import ErrorFallback from "../components/molecules/ErrorFallback";
import LoadingFallback from "../components/molecules/LoadingFallback";
import RevenueChart from "../components/organisms/RevenueChart";
import StatusDistributionChart from "../components/organisms/StatusDistributionChart";

// Create a properly typed wrapper for Grid
const Grid = MuiGrid as React.ComponentType<any>;

export default function MerchantDashboard() {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { data: plans = [], isLoading, error, refetch } = usePlans();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {/* Header section with greeting and actions */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="500">
            Merchant Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's an overview of your payment plans.
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => refetch()} color="primary" sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Create New Plan
          </Button>
        </Box>
      </Box>

      {/* Error display */}
      {error && <ErrorFallback error={error} resetError={() => refetch()} />}

      {/* Loading state */}
      {isLoading ? (
        <LoadingFallback message="Loading dashboard data..." />
      ) : (
        <Fade in={!isLoading} timeout={500}>
          <Box>
            {/* Analytics Cards */}
            <MerchantStats plans={plans} />

            {/* Charts section */}
            <Typography variant="h5" sx={{ mb: 3, mt: 5, fontWeight: 500 }}>
              Analytics Overview
            </Typography>

            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid item xs={12} md={8}>
                <RevenueChart plans={plans} />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatusDistributionChart plans={plans} />
              </Grid>
            </Grid>

            {/* Recent Plans */}
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
              Recent Payment Plans
            </Typography>

            {plans.length > 0 ? (
              <Grid container spacing={3}>
                {plans.slice(0, 3).map(plan => (
                  <Grid item xs={12} md={4} key={plan.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Plan #{plan.id}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          Amount: {parseFloat(plan.total_amount).toLocaleString()} SAR
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Customer: {plan.customer?.email ?? plan.customer?.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Start Date: {new Date(plan.start_date).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/plans/${plan.id}`)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Card sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  No payment plans created yet. Create your first plan to get started.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreateDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Create New Plan
                </Button>
              </Card>
            )}

            {plans.length > 3 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/plans")}
                >
                  View All Plans
                </Button>
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
      />
    </DashboardLayout>
  );
}
