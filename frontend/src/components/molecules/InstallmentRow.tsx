import { Button, Chip, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

export interface Inst {
  id: number;
  sequence: number;
  due_date: string;
  amount: string;
  status: "PENDING" | "PAID" | "LATE";
}

export function InstallmentRow({ inst }: { inst: Inst }) {
  const qc = useQueryClient();
  const pay = useMutation({
    mutationFn: () => api.post(`/installments/${inst.id}/pay/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 1 }}>
      <Typography width={120}>{inst.due_date}</Typography>
      <Chip
        label={inst.status}
        color={
          inst.status === "PENDING"
            ? "warning"
            : inst.status === "PAID"
            ? "success"
            : "error"
        }
      />
      <Typography sx={{ flexGrow: 1 }}>{inst.amount} SAR</Typography>
      {inst.status === "PENDING" && (
        <Button variant="outlined" size="small" onClick={() => pay.mutate()}>
          Pay now
        </Button>
      )}
    </Stack>
  );
}
