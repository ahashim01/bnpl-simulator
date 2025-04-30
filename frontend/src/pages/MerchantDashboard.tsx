import { useState } from "react";
import { Box, Container, Typography, Button, Tooltip, IconButton } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { usePlans } from "../hooks/useQueries";
import { useAuth } from "../hooks/AuthContext";
import MerchantStats from "../components/organisms/MerchantStats";
import PlansList from "../components/organisms/PlansList";
import CreatePlanDialog from "../components/organisms/CreatePlanDialog";
import ErrorFallback from "../components/molecules/ErrorFallback";

export default function MerchantDashboard() {
  const { user } = useAuth();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { data: plans = [], isLoading, error, refetch } = usePlans();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header section with greeting */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="500">
            Merchant Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back{user?.username ? `, ${user.username}` : ''}! Here's an overview of your payment plans.
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
      {error && <ErrorFallback error={error as Error} resetError={() => refetch()} />}

      {/* Analytics Cards */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
        Business Analytics
      </Typography>
      <MerchantStats plans={plans} />

      {/* Payment Plans Section with Tabs */}
      <PlansList
        plans={plans}
        isLoading={isLoading}
        onCreatePlan={() => setOpenCreateDialog(true)}
      />

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
      />
    </Container>
  );
}
