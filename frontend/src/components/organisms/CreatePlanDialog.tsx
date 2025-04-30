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
} from "@mui/material";
import { useCreatePlan } from "../../hooks/useQueries";
import { CreatePlanRequest } from "../../types/api";
import { useForm } from "../../hooks/useForm";
import { createPlanSchema } from "../../utils/validation";
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';
import AddIcon from '@mui/icons-material/Add';
import dayjs from "dayjs";

interface CreatePlanDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePlanDialog({ open, onClose }: Readonly<CreatePlanDialogProps>) {
  const createPlanMutation = useCreatePlan();

  const { values, errors, isSubmitting, handleChange, handleSubmit, reset } =
    useForm<CreatePlanRequest>({
      initialValues: {
        total_amount: "",
        start_date: dayjs().format("YYYY-MM-DD"),
        installments: 4,
        customer_email: "",
      },
      validationSchema: createPlanSchema,
      onSubmit: async (values) => {
        await createPlanMutation.mutateAsync(values);
        onClose();
        reset();
      },
    });

  // Handle dialog close
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          elevation: 3,
          sx: { borderRadius: 2, px: 1 }
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3 }}>
        <Box sx={{ typography: 'h5', fontWeight: 500 }}>Create Payment Plan</Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <form onSubmit={handleSubmit}>
            <FormControl variant="filled" fullWidth sx={{ mb: 3 }}>
              <InputLabel>Amount</InputLabel>
              <FilledInput
                name="total_amount"
                value={values.total_amount}
                onChange={handleChange}
                error={!!errors.total_amount}
                startAdornment={
                  <InputAdornment position="start">
                    <PaymentIcon color="action" />
                  </InputAdornment>
                }
                endAdornment={<InputAdornment position="end">SAR</InputAdornment>}
              />
              {errors.total_amount && (
                <FormHelperText error>{errors.total_amount}</FormHelperText>
              )}
            </FormControl>

            <FormControl variant="filled" fullWidth sx={{ mb: 3 }}>
              <InputLabel shrink>Start Date</InputLabel>
              <FilledInput
                name="start_date"
                type="date"
                value={values.start_date}
                onChange={handleChange}
                error={!!errors.start_date}
                startAdornment={
                  <InputAdornment position="start">
                    <CalendarMonthIcon color="action" />
                  </InputAdornment>
                }
              />
              {errors.start_date && (
                <FormHelperText error>{errors.start_date}</FormHelperText>
              )}
            </FormControl>

            <FormControl variant="filled" fullWidth sx={{ mb: 3 }}>
              <InputLabel>Number of Installments</InputLabel>
              <FilledInput
                name="installments"
                type="number"
                value={values.installments}
                onChange={handleChange}
                error={!!errors.installments}
              />
              {errors.installments && (
                <FormHelperText error>{errors.installments}</FormHelperText>
              )}
            </FormControl>

            <FormControl variant="filled" fullWidth sx={{ mb: 3 }}>
              <InputLabel>Customer Email</InputLabel>
              <FilledInput
                name="customer_email"
                value={values.customer_email}
                onChange={handleChange}
                error={!!errors.customer_email}
                type="email"
                startAdornment={
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                }
              />
              {errors.customer_email && (
                <FormHelperText error>{errors.customer_email}</FormHelperText>
              )}
              <FormHelperText>Enter the email address of an existing customer</FormHelperText>
            </FormControl>
          </form>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
        >
          {isSubmitting ? "Creating..." : "Create Plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
