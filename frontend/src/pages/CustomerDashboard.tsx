import { Container, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { InstallmentRow, Inst } from "../components/molecules/InstallmentRow";
import dayjs from "dayjs";

export default function CustomerDashboard() {
  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.get("/plans/").then(r => r.data),
  });

  const upcoming = plans.flatMap((p:any)=>p.installments)
                         .filter((i:Inst)=>i.status==="PENDING")
                         .sort((a,b)=>dayjs(a.due_date).unix()-dayjs(b.due_date).unix());

  const past = plans.flatMap((p:any)=>p.installments)
                    .filter((i:Inst)=>i.status!=="PENDING");

  return (
    <Container sx={{ py:4 }}>
      <Typography variant="h4">Upcoming installments</Typography>
      <Paper sx={{ p:2, mb:3 }}>
        {upcoming.length===0?"No upcoming":upcoming.map(i=><InstallmentRow key={i.id} inst={i}/>)}
      </Paper>

      <Typography variant="h4">History</Typography>
      <Paper sx={{ p:2 }}>
        {past.length===0?"No history":past.map(i=><InstallmentRow key={i.id} inst={i}/>)}
      </Paper>
    </Container>
  );
}
