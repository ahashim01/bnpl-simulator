import {
    Container, Typography, Paper, Stack, TextField, Button, Card, CardContent, Grid, Box,
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

    // Analytics calculations
    const totalRevenue = plans.reduce((a:any, p:any) => a + parseFloat(p.total_amount), 0);
    const paidRevenue = plans.filter((p:any) => p.status === "PAID")
                            .reduce((a:any, p:any) => a + parseFloat(p.total_amount), 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    // Count plans by status
    const totalPlans = plans.length;
    const activePlans = plans.filter((p:any) => p.status === "PENDING").length;
    const completedPlans = plans.filter((p:any) => p.status === "PAID").length;

    // Calculate success rate
    const successRate = totalPlans ? ((completedPlans / totalPlans) * 100).toFixed(1) : "0";

    // Get overdue installments
    const overdueInstallments = plans.flatMap((p:any) =>
      p.installments.filter((i:Inst) => i.status === "LATE")
    ).length;

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

        <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
        <Grid container spacing={2} sx={{ mb:4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
                <Typography variant="h5">{totalRevenue.toFixed(2)} SAR</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Collected Revenue</Typography>
                <Typography variant="h5">{paidRevenue.toFixed(2)} SAR</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Pending Revenue</Typography>
                <Typography variant="h5">{pendingRevenue.toFixed(2)} SAR</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Success Rate</Typography>
                <Typography variant="h5">{successRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb:4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Total Plans</Typography>
                <Typography variant="h5">{totalPlans}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Active Plans</Typography>
                <Typography variant="h5">{activePlans}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Overdue Installments</Typography>
                <Typography variant="h5" color="error">{overdueInstallments}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" gutterBottom>Payment Plans</Typography>
        {plans.map((p:any)=>(
          <Paper key={p.id} sx={{ p:2, mb:2 }}>
            <Typography variant="h6">Plan #{p.id} – {p.total_amount} SAR</Typography>
            <Typography variant="body2" color="text.secondary">
              Customer ID: {p.customer} • Started: {p.start_date}
            </Typography>
            <PlanProgress
              paid={p.installments.filter((i:Inst)=>i.status==="PAID").length}
              total={p.installments.length}/>
            {p.installments.map((i:Inst)=><InstallmentRow key={i.id} inst={i}/>)}
          </Paper>
        ))}
      </Container>
    );
  }
