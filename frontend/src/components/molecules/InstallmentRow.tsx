import { Box, Chip, Button, Tooltip, useTheme } from "@mui/material";
import { Installment } from "../../types/api";
import { PaymentStatus, STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatting";
import { usePayInstallment } from "../../hooks/useQueries";
import { motion } from "framer-motion";
import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

interface InstallmentRowProps {
  inst: Installment;
  delay?: number;
}

export function InstallmentRow({ inst, delay = 0 }: InstallmentRowProps) {
  const payInstallment = usePayInstallment();
  const theme = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isPaid = inst.status === PaymentStatus.PAID;
  const isPending = payInstallment.isPending;

  const handlePayment = () => {
    setShowConfirmation(true);
  };

  const confirmPayment = async () => {
    await payInstallment.mutateAsync(inst.id);
  };

  return (
    <>
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          delay: delay,
          ease: "easeOut"
        }}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          "&:last-of-type": {
            borderBottom: "none",
          },
        }}
      >
        <Box>
          <Box
            component="span"
            sx={{
              fontWeight: 500,
              mr: 2,
              color: isPaid ? 'text.secondary' : 'text.primary',
              textDecoration: isPaid ? 'line-through' : 'none',
            }}
          >
            {formatCurrency(inst.amount)}
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: "0.875rem",
              color: "text.secondary",
              textDecoration: isPaid ? 'line-through' : 'none',
            }}
          >
            {formatDate(inst.due_date)}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Chip
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            size="small"
            label={STATUS_LABELS[inst.status as PaymentStatus]}
            color={STATUS_COLORS[inst.status as PaymentStatus]}
            sx={{ mr: 1 }}
          />

          {!isPaid && (
            <Tooltip title="Pay this installment">
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variant="outlined"
                size="small"
                onClick={handlePayment}
                disabled={isPending}
                color="primary"
              >
                Pay
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      <ConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmPayment}
        title="Confirm Payment"
        description={`Are you sure you want to pay ${formatCurrency(inst.amount)} for this installment?`}
        confirmLabel="Pay Now"
        type="info"
      />
    </>
  );
}
