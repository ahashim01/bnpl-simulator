import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Collapse,
  Box,
  LinearProgress,
  Divider,
} from "@mui/material";
import { ExpandMore, CalendarToday, EventAvailable } from "@mui/icons-material";
import dayjs from "dayjs";
import { PaymentPlan } from "../../types/api";
import { PaymentStatus, STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
import { formatCurrency, formatDateDistance } from "../../utils/formatting";

interface UpcomingPaymentCardProps {
  plan: PaymentPlan;
}

export default function UpcomingPaymentCard({ plan }: Readonly<UpcomingPaymentCardProps>) {
  const [expanded, setExpanded] = useState(false);

  // Find the next pending payment
  const nextInstallment = plan.installments.find(
    inst => inst.status === PaymentStatus.PENDING
  );

  if (!nextInstallment) return null;

  // Calculate days until due
  const dueDate = dayjs(nextInstallment.due_date);
  const today = dayjs();
  const daysUntilDue = dueDate.diff(today, 'day');

  // Calculate progress
  const totalInstallments = plan.installments.length;
  const paidInstallments = plan.paid_installments;
  const progress = (paidInstallments / totalInstallments) * 100;

  // Helper function to determine color based on days until due
  const getDueDateColor = () => {
    if (daysUntilDue <= 0) return "error";
    if (daysUntilDue <= 3) return "warning";
    return "primary";
  };

  // Helper function to get the formatted due date text
  const getDueDateText = () => {
    if (daysUntilDue < 0) {
      return `Overdue by ${Math.abs(daysUntilDue)} days`;
    }
    if (daysUntilDue === 0) {
      return "Due today";
    }
    return `Due in ${daysUntilDue} days`;
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ pb: 1, pt: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={500}>
            Plan #{plan.id}
          </Typography>
          <Chip
            size="small"
            label={STATUS_LABELS[plan.status]}
            color={STATUS_COLORS[plan.status]}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Total Amount: {formatCurrency(plan.total_amount)}
        </Typography>

        <Box sx={{ mt: 2, mb: 1 }}>
          <Box sx={{ display: "flex", mb: 0.5, alignItems: "center" }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                width: "100%",
                backgroundColor: "action.hover",
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {paidInstallments} of {totalInstallments} installments paid
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <CalendarToday
            fontSize="small"
            color={getDueDateColor()}
            sx={{ mr: 1 }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 500 }}
            color={getDueDateColor()}
          >
            {getDueDateText()}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatCurrency(nextInstallment.amount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Due date: {formatDateDistance(nextInstallment.due_date)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            disableElevation
            color={getDueDateColor()}
            onClick={() => setExpanded(!expanded)}
            endIcon={<ExpandMore sx={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: theme => theme.transitions.create('transform'),
            }} />}
          >
            {expanded ? "Hide Details" : "View Details"}
          </Button>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="body2" gutterBottom>
              <strong>Merchant:</strong> {plan.merchant?.username}
            </Typography>

            <Typography variant="body2" gutterBottom>
              <strong>Start Date:</strong> {new Date(plan.start_date).toLocaleDateString()}
            </Typography>

            <Typography variant="body2" gutterBottom>
              <strong>Installment:</strong> {nextInstallment.sequence} of {totalInstallments}
            </Typography>

            <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
              <EventAvailable fontSize="small" sx={{ mr: 1, color: "success.main" }} />
              <Typography variant="body2">
                {paidInstallments} installments paid ({formatCurrency(paidInstallments * parseFloat(nextInstallment.amount))})
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
