import {
    Paper,
    Box,
    Typography,
    Chip,
    Divider,
    Collapse,
    IconButton
  } from "@mui/material";
  import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
  import ExpandLessIcon from '@mui/icons-material/ExpandLess';
  import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
  import PersonIcon from '@mui/icons-material/Person';
  import { useState } from "react";
  import { InstallmentRow } from "./InstallmentRow";
  import PlanProgress from "../atoms/Progress";
  import { PaymentPlan } from "../../types/api";
  import { PaymentStatus, PLAN_STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
  import { formatCurrency } from "../../utils/formatting";

  interface PlanCardProps {
    plan: PaymentPlan;
  }

  export default function PlanCard({ plan }: PlanCardProps) {
    const [expanded, setExpanded] = useState(false);

    return (
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mr: 1 }}>Plan #{plan.id}</Typography>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                aria-label={expanded ? "collapse" : "expand"}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Typography variant="body1" fontWeight={500}>
              {formatCurrency(plan.total_amount)}
            </Typography>
            {plan.customer && (
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                Customer: {plan.customer.email || plan.customer.username}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
              Started: {new Date(plan.start_date).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip
            label={PLAN_STATUS_LABELS[plan.status as PaymentStatus] || plan.status}
            color={STATUS_COLORS[plan.status as PaymentStatus] || "default"}
            variant="outlined"
          />
        </Box>

        <PlanProgress
          paid={plan.paid_installments}
          total={plan.total_installments}
        />

        <Collapse in={expanded} timeout="auto">
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            Installments
          </Typography>
          {plan.installments.map(installment => (
            <InstallmentRow key={installment.id} inst={installment} />
          ))}
        </Collapse>
      </Paper>
    );
  }
