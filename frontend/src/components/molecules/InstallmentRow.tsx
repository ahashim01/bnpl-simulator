import { Button, Chip, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { useAuth } from "../../hooks/AuthContext";

export interface Inst {
  id: number;
  sequence: number;
  due_date: string;
  amount: string;
  status: string;
}

// Status code to display text mapping
const STATUS_MAP: Record<string, string> = {
  "P": "Pending", // Keep Pending for installments (more intuitive for individual payments)
  "D": "Paid",
  "L": "Late"
};

// Status code to chip color mapping
const STATUS_COLOR_MAP: Record<string, "success" | "warning" | "primary" | "error"> = {
  "P": "primary",
  "D": "success",
  "L": "error"
};

export function InstallmentRow({ inst }: { inst: Inst }) {
  const qc = useQueryClient();
  const { user } = useAuth(); // Get current user to check if they're a merchant

  // In a production environment, this would integrate with a payment gateway
  const pay = useMutation({
    mutationFn: () => {
      // NOTE: In a real production environment, this would:
      // 1. Redirect to a payment gateway (like Stripe, PayPal, etc.)
      // 2. Process payment information securely
      // 3. Handle payment confirmation via webhooks
      // 4. Only mark as paid after successful payment confirmation
      return api.post(`/installments/${inst.id}/pay/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
    onError: (error) => {
      console.error("Payment error:", error);
    }
  });

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 1 }}>
      <Typography width={120}>{inst.due_date}</Typography>
      <Chip
        label={STATUS_MAP[inst.status] || inst.status}
        color={STATUS_COLOR_MAP[inst.status] || "default"}
        variant="outlined"
        size="small"
      />
      <Typography sx={{ flexGrow: 1 }}>{inst.amount} SAR</Typography>

      {/* Only show Pay Now button for customers (non-merchants) and for pending installments */}
      {inst.status === "P" && user && !user.isMerchant && (
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
