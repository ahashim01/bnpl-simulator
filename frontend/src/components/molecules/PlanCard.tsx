import {
  Paper,
  Box,
  Typography,
  Chip,
  Divider,
  Collapse,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState } from "react";
import { motion } from "framer-motion";
import { InstallmentRow } from "./InstallmentRow";
import PlanProgress from "../atoms/Progress";
import { PaymentPlan } from "../../types/api";
import { PaymentStatus, PLAN_STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatting";
import { useNavigate } from "react-router-dom";

interface PlanCardProps {
  plan: PaymentPlan;
  delay?: number;
}

export default function PlanCard({ plan, delay = 0 }: PlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Calculate actual counts directly from installments array
  const totalInstallments = plan.installments.length;
  const paidInstallments = plan.installments.filter(inst => inst.status === PaymentStatus.PAID).length;

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: delay * 0.15,
        ease: "easeOut"
      }}
      whileHover={{ y: -5 }}
      sx={{
        p: isMobile ? 2 : 3,
        mb: 3,
        borderRadius: 2,
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'flex-start',
        mb: 2
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ mr: 1 }}>Plan #{plan.id}</Typography>
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
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

          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => navigate(`/plans/${plan.id}`)}
            sx={{ mt: 2 }}
          >
            View Details
          </Button>
        </Box>

        {isMobile ? (
          <Box sx={{ mt: 2, width: '100%' }}>
            <Chip
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              label={PLAN_STATUS_LABELS[plan.status as PaymentStatus] || plan.status}
              color={STATUS_COLORS[plan.status as PaymentStatus] || "default"}
              variant="outlined"
              size="small"
            />
          </Box>
        ) : (
          <Chip
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            label={PLAN_STATUS_LABELS[plan.status as PaymentStatus] || plan.status}
            color={STATUS_COLORS[plan.status as PaymentStatus] || "default"}
            variant="outlined"
          />
        )}
      </Box>

      <PlanProgress
        paid={paidInstallments}
        total={totalInstallments}
      />

      <Collapse in={expanded} timeout="auto">
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
          Installments
        </Typography>
        {plan.installments.map((installment, idx) => (
          <InstallmentRow
            key={installment.id}
            inst={installment}
            delay={idx * 0.05}
          />
        ))}
      </Collapse>
    </Paper>
  );
}
