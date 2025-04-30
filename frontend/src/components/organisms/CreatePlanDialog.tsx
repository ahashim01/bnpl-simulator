import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    InputAdornment,
    CircularProgress,
    FormControl,
    InputLabel,
    FormHelperText,
    FilledInput,
    Typography
  } from "@mui/material";
  import { useState } from "react";
  import { useCreatePlan } from "../../hooks/useQueries";
  import { CreatePlanRequest } from "../../types/api";
  import EmailIcon from '@mui/icons-material/Email';
  import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
  import PaymentIcon from '@mui/icons-material/Payment';
  import AddIcon from '@mui/icons-material/Add';
  import dayjs from "dayjs";

  interface CreatePlanDialogProps {
    open: boolean;
    onClose: () => void;
  }

  export default function CreatePlanDialog({ open, onClose }: CreatePlanDialogProps) {
    const [form, setForm] = useState<CreatePlanRequest>({
      total_amount: "",
      start_date: dayjs().format("YYYY-MM-DD"),
      installments: 4,
      customer_email: "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const createPlanMutation = useCreatePlan();

    const resetForm = () => {
      setForm({
        total_amount: "",
        start_date: dayjs().format("YYYY-MM-DD"),
        installments: 4,
        customer_email: "",
      });
      setFormErrors({});
    };

    const validateForm = () => {
      const errors: Record<string, string> = {};

      if (!form.total_amount) {
        errors.total_amount = "Total amount is required";
      } else if (isNaN(Number(form.total_amount)) || Number(form.total_amount) <= 0) {
        errors.total_amount = "Must be a positive number";
      }

      if (!form.customer_email) {
        errors.customer_email = "Customer email is required";
      } else if (!/\S+@\S+\.\S+/.test(form.customer_email)) {
        errors.customer_email = "Email address is invalid";
      }

      if (!form.installments || form.installments < 1) {
        errors.installments = "At least 1 installment required";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleCreatePlan = async () => {
      if (validateForm()) {
        try {
          await createPlanMutation.mutateAsync(form);
          onClose();
          resetForm();
        } catch (error: any) {
          // Handle API validation errors
          if (error.response?.data) {
            const apiErrors: Record<string, string> = {};

            // Convert API errors to our format
            Object.entries(error.response.data).forEach(([key, value]) => {
              apiErrors[key] = Array.isArray(value) ? value.join(', ') : String(value);
            });

            setFormErrors(apiErrors);
          }
        }
      }
    };

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, px: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Box sx={{ typography: 'h5', fontWeight: 500 }}>Create Payment Plan</Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl variant="filled" fullWidth sx={{ mb: 3 }}>
              <InputLabel>Amount</InputLabel>
              <FilledInput
                value={form.total_amount}
                onChange={e => setForm({...form, total_amount: e.target.value})}
                error={!!formErrors.total_amount}
                startAdornment={
                  <InputAdornment position="start">
                    <PaymentIcon color="action" />
                  </InputAdornment>
                }
                endAdornment={<InputAdornment position="end">SAR</InputAdornment>}
              />
              {formErrors.total_amount && (
                <FormHelperText error>{formErrors.total_amount}</FormHelperText>
              )}
            </FormControl>

            <FormControl variant="filled" fullWidth sx={{ mb: 3 }}>
              <InputLabel shrink>Start Date</InputLabel>
              <FilledInput
                type="date"
                value={form.start_date}
                onChange={e => setForm({...form, start_date: e.target.value})}
                error={!!formErrors.start_date}
                startAdornment={
                  <InputAdornment position="start">
                    <CalendarMonthIcon color="action" />
                  </InputAdornment>
                }
              />
              {formErrors.start_date && (
                <FormHelperText error>{formErrors.start_date}</FormHelperText>
              )}
            </FormControl>

            <FormControl variant="filled" fullWidth sx={{ mb: 3 }}>
              <InputLabel>Number of Installments</InputLabel>
              <FilledInput
                type="number"
                value={form.installments}
                onChange={e => setForm({...form, installments: Number(e.target.value)})}
                error={!!formErrors.installments}
              />
              {formErrors.installments && (
                <FormHelperText error>{formErrors.installments}</FormHelperText>
              )}
            </FormControl>

            <FormControl variant="filled" fullWidth sx={{ mb: 3 }}>
              <InputLabel>Customer Email</InputLabel>
              <FilledInput
                value={form.customer_email}
                onChange={e => setForm({...form, customer_email: e.target.value})}
                error={!!formErrors.customer_email}
                type="email"
                startAdornment={
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                }
              />
              {formErrors.customer_email && (
                <FormHelperText error>{formErrors.customer_email}</FormHelperText>
              )}
              <FormHelperText>Enter the email address of an existing customer</FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePlan}
            disabled={createPlanMutation.isPending}
            startIcon={createPlanMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          >
            {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
