import { Container, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { InstallmentRow, Inst } from "../components/molecules/InstallmentRow";

export default function UserDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans/").then((r) => r.data),
  });

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4">My Installments</Typography>
      {isLoading
        ? "Loading…"
        : data.flatMap((p: any) =>
            p.installments.map((i: Inst) => (
              <InstallmentRow key={i.id} inst={i} />
            ))
          )}
    </Container>
  );
}
