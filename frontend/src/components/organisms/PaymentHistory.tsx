import { Typography, Paper } from "@mui/material";
import { Installment } from "../../types/api";
import { PaymentStatus } from "../../utils/constants";
import { InstallmentRow } from "../molecules/InstallmentRow";

interface PaymentHistoryProps {
  installments: Installment[];
}

export default function PaymentHistory({ installments }: PaymentHistoryProps) {
  const pastPayments = installments
    .filter(i => i.status !== PaymentStatus.PENDING)
    .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());

  if (pastPayments.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 500 }}>
        Payment History
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {pastPayments.slice(0, 5).map(installment => (
          <InstallmentRow key={installment.id} inst={installment} />
        ))}
      </Paper>
    </>
  );
}
