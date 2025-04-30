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
  import { InstallmentRow } from "../components/molecules/InstallmentRow";
  import { Installment, PaymentPlan } from "../types/api";

  export default function MerchantPlans() {
    const [form, setForm] = useState({
      total_amount: "",
      start_date: "",
      installments: 4,
      customer_email: "",
    });

    const createPlan = useMutation({
      mutationFn: () => {
        // Ensure numeric values are properly formatted before sending to backend
        const formattedData = {
          ...form,
          total_amount: form.total_amount,
          installments: parseInt(String(form.installments), 10),
          customer_email: form.customer_email
        };
        return api.createPlan(formattedData);
      },
      onSuccess: () => plans.refetch(),
    });

    const plans = useQuery({
      queryKey: ["plans"],
      queryFn: () => api.getPlans(),
    });

    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create BNPL Plan
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          {(["total_amount", "start_date", "installments", "customer_email"] as const).map(
            (f) => {
              let inputType = "text";
              if (f === "start_date") {
                inputType = "date";
              } else if (f === "installments") {
                inputType = "number";
              }

              return (
                <TextField
                  key={f}
                  label={f.replace("_", " ")}
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  type={inputType}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              );
            }
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
        ) : plans.data ? (
          plans.data.map((plan: PaymentPlan) => (
            <div key={plan.id}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Plan #{plan.id} – {plan.status}
              </Typography>
              {plan.installments?.map((installment: Installment) => (
                <InstallmentRow key={installment.id} inst={installment} />
              ))}
            </div>
          ))
        ) : (
          "No plans available"
        )}
      </Container>
    );
  }
