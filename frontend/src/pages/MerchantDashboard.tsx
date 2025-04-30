import {
    Container, Typography, Paper, Stack, TextField, Button, Card, CardContent,
  } from "@mui/material";
  import dayjs from "dayjs";
  import { useState } from "react";
  import { useQuery, useMutation } from "@tanstack/react-query";
  import api from "../services/api";
  import { InstallmentRow, Inst } from "../components/molecules/InstallmentRow";
  import PlanProgress from "../components/atoms/Progress";

  export default function MerchantDashboard() {
    const [form, setForm] = useState({
      total_amount: "",
      start_date: dayjs().format("YYYY-MM-DD"),
      installments: 4,
      customer_id: "",
    });

    const { data: plans = [], refetch } = useQuery({
      queryKey: ["plans"],
      queryFn: () => api.get("/plans/").then(r => r.data),
    });

    const create = useMutation({
      mutationFn: () => api.post("/plans/", form),
      onSuccess: () => refetch(),
    });

    // quick metrics
    const revenue = plans.filter((p:any)=>p.status==="PAID")
                         .reduce((a:any,p:any)=>a+p.total_amount,0);

    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p:2, mb:4 }}>
          <Typography variant="h5" gutterBottom>Create Plan</Typography>
          <Stack direction="row" spacing={2}>
            {(["total_amount","start_date","installments","customer_id"] as const).map(f=>(
              <TextField key={f} label={f} type={f==="start_date"?"date":"text"}
                value={(form as any)[f]}
                onChange={e=>setForm({...form,[f]:e.target.value})}
                InputLabelProps={{shrink:true}}/>
            ))}
            <Button variant="contained" onClick={()=>create.mutate()} disabled={create.isPending}>Create</Button>
          </Stack>
        </Paper>

        <Card sx={{ mb:3 }}><CardContent>
          <Typography>Total revenue (paid plans): {revenue} SAR</Typography>
        </CardContent></Card>

        {plans.map((p:any)=>(
          <Paper key={p.id} sx={{ p:2, mb:2 }}>
            <Typography variant="h6">Plan #{p.id} – {p.total_amount} SAR</Typography>
            <PlanProgress
              paid={p.installments.filter((i:Inst)=>i.status==="PAID").length}
              total={p.installments.length}/>
            {p.installments.map((i:Inst)=><InstallmentRow key={i.id} inst={i}/>)}
          </Paper>
        ))}
      </Container>
    );
  }
