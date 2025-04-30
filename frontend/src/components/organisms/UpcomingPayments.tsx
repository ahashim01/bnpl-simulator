import { Typography, Paper } from "@mui/material";
import { Installment } from "../../types/api";
import { PaymentStatus } from "../../utils/constants";
import { InstallmentRow } from "../molecules/InstallmentRow";

interface UpcomingPaymentsProps {
  installments: Installment[];
}

export default function UpcomingPayments({ installments }: UpcomingPaymentsProps) {
  const upcoming = installments
    .filter(i => i.status === PaymentStatus.PENDING)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  if (upcoming.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 500 }}>
        Upcoming installments
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {upcoming.slice(0, 5).map(installment => (
          <InstallmentRow key={installment.id} inst={installment} />
        ))}
      </Paper>
    </>
  );
}
