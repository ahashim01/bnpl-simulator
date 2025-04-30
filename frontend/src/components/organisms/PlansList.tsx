import { useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Button, Fade } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { PaymentPlan } from "../../types/api";
import { PaymentStatus } from "../../utils/constants";
import PlanCard from "../molecules/PlanCard";
import LoadingFallback from "../molecules/LoadingFallback";

interface PlansListProps {
  plans: PaymentPlan[];
  isLoading: boolean;
  onCreatePlan: () => void;
}

export default function PlansList({ plans, isLoading, onCreatePlan }: PlansListProps) {
  const [tabValue, setTabValue] = useState(0);

  // Count plan types
  const activePlans = plans.filter(p => p.status === PaymentStatus.PENDING).length;
  const completedPlans = plans.filter(p => p.status === PaymentStatus.PAID).length;

  // Filter plans by status based on active tab
  const filteredPlans = tabValue === 0
    ? plans
    : tabValue === 1
      ? plans.filter(p => p.status === PaymentStatus.PENDING)
      : plans.filter(p => p.status === PaymentStatus.PAID);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>Payment Plans</Typography>
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="All Plans" />
        <Tab label={`Active (${activePlans})`} />
        <Tab label={`Completed (${completedPlans})`} />
      </Tabs>

      {isLoading ? (
        <LoadingFallback message="Loading payment plans..." />
      ) : filteredPlans.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No payment plans found in this category.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreatePlan}
            sx={{ mt: 2 }}
          >
            Create New Plan
          </Button>
        </Paper>
      ) : (
        <Fade in={!isLoading}>
          <Box>
            {filteredPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </Box>
        </Fade>
      )}
    </Box>
  );
}
