import {
    Button,
    Container,
    Stack,
    TextField,
    Typography,
  } from "@mui/material";
  import { useState } from "react";
  import { useMutation, useQuery } from "@tanstack/react-query";
  import api from "../services/api";
  import { InstallmentRow, Inst } from "../components/molecules/InstallmentRow";

  export default function MerchantPlans() {
    const [form, setForm] = useState({
      total_amount: "",
      start_date: "",
      installments: 4,
      customer_id: "",
    });

    const createPlan = useMutation({
      mutationFn: () => api.post("/plans/", form),
      onSuccess: () => plans.refetch(),
    });

    const plans = useQuery({
      queryKey: ["plans"],
      queryFn: () => api.get("/plans/").then((r) => r.data),
    });

    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create BNPL Plan
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {(["total_amount", "start_date", "installments", "customer_id"] as const).map(
            (f) => (
              <TextField
                key={f}
                label={f.replace("_", " ")}
                value={(form as any)[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                type={f === "start_date" ? "date" : "text"}
                InputLabelProps={{ shrink: true }}
              />
            )
          )}
          <Button
            variant="contained"
            onClick={() => createPlan.mutate()}
            disabled={createPlan.isPending}
          >
            Create
          </Button>
        </Stack>

        {plans.isLoading ? (
          "Loading…"
        ) : (
          plans.data.map((p: any) => (
            <div key={p.id}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Plan #{p.id} – {p.status}
              </Typography>
              {p.installments.map((i: Inst) => (
                <InstallmentRow key={i.id} inst={i} />
              ))}
            </div>
          ))
        )}
      </Container>
    );
  }
