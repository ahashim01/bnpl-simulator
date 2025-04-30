import {
    Container, Typography, Paper, Stack, TextField, Button, Card, CardContent, Grid, Box,
    Divider, Tab, Tabs, Alert, IconButton, Tooltip, useTheme, Chip, Fade,
    Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, CircularProgress,
    FormControl, InputLabel, FilledInput, FormHelperText, Autocomplete
  } from "@mui/material";
  import dayjs from "dayjs";
  import { useState, SyntheticEvent } from "react";
  import { useQuery, useMutation } from "@tanstack/react-query";
  import api from "../services/api";
  import { InstallmentRow, Inst } from "../components/molecules/InstallmentRow";
  import PlanProgress from "../components/atoms/Progress";
  import AddIcon from '@mui/icons-material/Add';
  import RefreshIcon from '@mui/icons-material/Refresh';
  import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
  import TrendingUpIcon from '@mui/icons-material/TrendingUp';
  import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
  import PendingIcon from '@mui/icons-material/Pending';
  import DoneIcon from '@mui/icons-material/Done';
  import WarningIcon from '@mui/icons-material/Warning';
  import EmailIcon from '@mui/icons-material/Email';
  import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
  import PaymentIcon from '@mui/icons-material/Payment';
  import PersonIcon from '@mui/icons-material/Person';
  import { styled } from '@mui/material/styles';
  import { useAuth } from "../hooks/AuthContext";

  // Enhanced styled components for better visuals
  const StatsCard = styled(Card)(({ theme }) => ({
    height: '100%',
    transition: 'all 0.3s ease-in-out',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[1],
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: theme.shadows[3],
    },
  }));

  const IconContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 54,
    height: 54,
    borderRadius: '50%',
    marginBottom: theme.spacing(1),
  }));

  const StatsValue = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '2rem',
    marginTop: theme.spacing(1),
    color: theme.palette.text.primary,
  }));

  const FormField = styled(FormControl)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
    },
    '& .MuiFilledInput-root': {
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.04)',
      transition: theme.transitions.create(['background-color', 'box-shadow']),
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.13)' : 'rgba(0, 0, 0, 0.06)',
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.13)' : 'rgba(0, 0, 0, 0.06)',
      }
    }
  }));

  export default function MerchantDashboard() {
    const theme = useTheme();
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [form, setForm] = useState({
      total_amount: "",
      start_date: dayjs().format("YYYY-MM-DD"),
      installments: 4,
      customer_email: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch customers for the dropdown - Fix the incorrect URL
    const { data: customers = [] } = useQuery({
      queryKey: ["customers"],
      queryFn: () => api.get("/customers/").then(r => r.data).catch(() => []),
      // If API endpoint doesn't exist yet, silently fail and use empty array
    });

    const { data: plans = [], refetch, isLoading, error } = useQuery({
      queryKey: ["plans"],
      queryFn: () => api.get("/plans/").then(r => r.data),
    });

    const create = useMutation({
      mutationFn: () => api.post("/plans/", form),
      onSuccess: () => {
        refetch();
        setOpenCreateDialog(false);
        resetForm();
      },
      onError: (error: any) => {
        const errorData = error.response?.data || {};
        const newErrors: Record<string, string> = {};

        Object.keys(errorData).forEach(key => {
          newErrors[key] = Array.isArray(errorData[key])
            ? errorData[key].join(', ')
            : String(errorData[key]);
        });

        setFormErrors(newErrors);
      }
    });

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

      if (!form.installments || Number(form.installments) < 1) {
        errors.installments = "At least 1 installment required";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleCreatePlan = () => {
      if (validateForm()) {
        create.mutate();
      }
    };

    const handleTabChange = (event: SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    };

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

    // Filter plans by status based on active tab
    const filteredPlans = tabValue === 0
      ? plans
      : tabValue === 1
        ? plans.filter((p:any) => p.status === "PENDING")
        : plans.filter((p:any) => p.status === "PAID");

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header section with greeting */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="500">
              Merchant Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back{user?.username ? `, ${user.username}` : ''}! Here's an overview of your payment plans.
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Refresh data">
              <IconButton onClick={() => refetch()} color="primary" sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create New Plan
            </Button>
          </Box>
        </Box>

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading data. Please try refreshing.
          </Alert>
        )}

        {/* Analytics Cards */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
          Business Analytics
        </Typography>
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <IconContainer sx={{ bgcolor: 'primary.light' }}>
                  <CurrencyExchangeIcon sx={{ color: 'primary.main' }} />
                </IconContainer>
                <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
                <StatsValue>{totalRevenue.toFixed(2)} SAR</StatsValue>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <IconContainer sx={{ bgcolor: 'success.light' }}>
                  <AccountBalanceIcon sx={{ color: 'success.main' }} />
                </IconContainer>
                <Typography variant="subtitle2" color="text.secondary">Collected Revenue</Typography>
                <StatsValue>{paidRevenue.toFixed(2)} SAR</StatsValue>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <IconContainer sx={{ bgcolor: 'info.light' }}>
                  <PendingIcon sx={{ color: 'info.main' }} />
                </IconContainer>
                <Typography variant="subtitle2" color="text.secondary">Pending Revenue</Typography>
                <StatsValue>{pendingRevenue.toFixed(2)} SAR</StatsValue>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <IconContainer sx={{ bgcolor: 'success.light' }}>
                  <TrendingUpIcon sx={{ color: 'success.main' }} />
                </IconContainer>
                <Typography variant="subtitle2" color="text.secondary">Success Rate</Typography>
                <StatsValue>{successRate}%</StatsValue>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconContainer sx={{ bgcolor: 'primary.light', mr: 2, mb: 0 }}>
                    <DoneIcon sx={{ color: 'primary.main' }} />
                  </IconContainer>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Total Plans</Typography>
                    <Typography variant="h4" fontWeight={600}>{totalPlans}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconContainer sx={{ bgcolor: 'info.light', mr: 2, mb: 0 }}>
                    <PendingIcon sx={{ color: 'info.main' }} />
                  </IconContainer>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Active Plans</Typography>
                    <Typography variant="h4" fontWeight={600}>{activePlans}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconContainer sx={{ bgcolor: 'error.light', mr: 2, mb: 0 }}>
                    <WarningIcon sx={{ color: 'error.main' }} />
                  </IconContainer>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Overdue Installments</Typography>
                    <Typography variant="h4" fontWeight={600} color="error">{overdueInstallments}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Payment Plans Section with Tabs */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>Payment Plans</Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="All Plans" />
            <Tab label={`Active (${activePlans})`} />
            <Tab label={`Completed (${completedPlans})`} />
          </Tabs>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredPlans.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No payment plans found in this category.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
                sx={{ mt: 2 }}
              >
                Create New Plan
              </Button>
            </Paper>
          ) : (
            <Fade in={!isLoading}>
              <Box>
                {filteredPlans.map((p:any) => (
                  <Paper key={p.id} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">Plan #{p.id}</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {p.total_amount} SAR
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Customer: {p.customer?.email || "Unknown"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Started: {p.start_date}
                        </Typography>
                      </Box>
                      <Chip
                        label={p.status}
                        color={p.status === "PAID" ? "success" : "primary"}
                        variant="outlined"
                      />
                    </Box>

                    <PlanProgress
                      paid={p.paid_installments || p.installments.filter((i:Inst) => i.status === "PAID").length}
                      total={p.total_installments || p.installments.length}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                      Installments
                    </Typography>

                    {p.installments.map((i:Inst) => (
                      <InstallmentRow key={i.id} inst={i} />
                    ))}
                  </Paper>
                ))}
              </Box>
            </Fade>
          )}
        </Box>

        {/* Create Plan Dialog */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: 2, px: 1 }
          }}
        >
          <DialogTitle sx={{ pb: 1, pt: 3 }}>
            {/* Fix: Changed from Typography variant="h5" to just use regular text */}
            <Box sx={{ typography: 'h5', fontWeight: 500 }}>Create Payment Plan</Box>
          </DialogTitle>

          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormField variant="filled" fullWidth>
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
              </FormField>

              <FormField variant="filled" fullWidth>
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
              </FormField>

              <FormField variant="filled" fullWidth>
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
              </FormField>

              <FormField variant="filled" fullWidth>
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
              </FormField>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
            <Button onClick={() => setOpenCreateDialog(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreatePlan}
              disabled={create.isPending}
              startIcon={create.isPending ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            >
              {create.isPending ? "Creating..." : "Create Plan"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }
