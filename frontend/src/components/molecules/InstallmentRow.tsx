import { Button, Chip, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/AuthContext";
import apiService from "../../services/api";
import { Installment as InstallmentType } from "../../types/api";
import { PaymentStatus, STATUS_LABELS, STATUS_COLORS } from "../../utils/constants";
import { formatCurrency, formatDate } from "../../utils/formatting";

interface InstallmentRowProps {
  inst: InstallmentType;
}

export function InstallmentRow({ inst }: InstallmentRowProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const pay = useMutation({
    mutationFn: () => apiService.payInstallment(inst.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
    onError: (error) => {
      console.error("Payment error:", error);
    }
  });

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 1 }}>
      <Typography width={120}>{formatDate(inst.due_date)}</Typography>
      <Chip
        label={STATUS_LABELS[inst.status as PaymentStatus] || inst.status}
        color={STATUS_COLORS[inst.status as PaymentStatus] || "default"}
        variant="outlined"
        size="small"
      />
      <Typography sx={{ flexGrow: 1 }}>{formatCurrency(inst.amount)}</Typography>

      {/* Only show Pay Now button for customers (non-merchants) and for pending installments */}
      {inst.status === PaymentStatus.PENDING && user && !user.isMerchant && (
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => pay.mutate()}
          disabled={pay.isPending}
        >
          {pay.isPending ? "Processing..." : "Pay now"}
        </Button>
      )}
    </Stack>
  );
}
