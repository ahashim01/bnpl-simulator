import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Box,
  Chip,
  InputAdornment,
  IconButton,
  LinearProgress,
  FormHelperText,
  Divider
} from "@mui/material";
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    is_merchant: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors: Record<string, string[]> = {};

    if (!form.username.trim()) {
      newErrors.username = ["Username is required"];
    }

    if (!form.email.trim()) {
      newErrors.email = ["Email is required"];
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = ["Email is invalid"];
    }

    if (!form.password) {
      newErrors.password = ["Password is required"];
    } else if (form.password.length < 8) {
      newErrors.password = ["Password must be at least 8 characters"];
    }

    if (form.password !== form.confirm_password) {
      newErrors.confirm_password = ["Passwords don't match"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError("");

    try {
      // Only send necessary fields to the backend
      const registrationData = {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        is_merchant: form.is_merchant
      };

      await api.post("/register/", registrationData);
      nav("/login");
    } catch (error: any) {
      if (error.response?.data) {
        // Handle API error responses
        setErrors(error.response.data);

        if (error.response.data.non_field_errors) {
          setGeneralError(error.response.data.non_field_errors.join(", "));
        } else if (typeof error.response.data === 'string') {
          setGeneralError(error.response.data);
        }
      } else {
        setGeneralError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = () => {
    if (!form.password) return 0;

    let strength = 0;

    // Length check
    if (form.password.length >= 8) strength += 25;

    // Contains lowercase
    if (/[a-z]/.test(form.password)) strength += 25;

    // Contains uppercase
    if (/[A-Z]/.test(form.password)) strength += 25;

    // Contains number or special char
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) strength += 25;

    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = calculatePasswordStrength();
    if (strength < 25) return "error";
    if (strength < 75) return "warning";
    return "success";
  };

  const handleChange = (field: string, value: string) => {
    setForm({...form, [field]: value});
    // Clear errors for this field
    if (errors[field]) {
      const newErrors = {...errors};
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="500">
          Create Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          {form.is_merchant ? "Merchant Registration" : "Customer Registration"}
        </Typography>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {generalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generalError}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <Box>
            <Chip
              label={form.is_merchant ? "Switch to Customer" : "Switch to Merchant"}
              onClick={()=>setForm({...form, is_merchant: !form.is_merchant})}
              color={form.is_merchant ? "primary" : "default"}
              sx={{ mb: 2, cursor: 'pointer' }}
            />
          </Box>

          <TextField
            label="Username"
            value={form.username}
            onChange={e => handleChange("username", e.target.value)}
            error={!!errors.username}
            helperText={errors.username?.join(", ")}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email?.join(", ")}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="First Name"
              value={form.first_name}
              onChange={e => handleChange("first_name", e.target.value)}
              error={!!errors.first_name}
              helperText={errors.first_name?.join(", ")}
              fullWidth
            />

            <TextField
              label="Last Name"
              value={form.last_name}
              onChange={e => handleChange("last_name", e.target.value)}
              error={!!errors.last_name}
              helperText={errors.last_name?.join(", ")}
              fullWidth
            />
          </Box>

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={e => handleChange("password", e.target.value)}
            error={!!errors.password}
            helperText={errors.password?.join(", ")}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {form.password && (
            <>
              <FormHelperText>
                Password strength:
              </FormHelperText>
              <LinearProgress
                variant="determinate"
                value={calculatePasswordStrength()}
                color={getPasswordStrengthColor() as "error" | "warning" | "success"}
                sx={{ mb: 1, height: 8, borderRadius: 1 }}
              />
              <Box sx={{ bgcolor: "rgba(0,0,0,0.03)", p: 1.5, borderRadius: 1 }}>
                <Typography variant="caption" display="block" sx={{ fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center' }}>
                  <InfoIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }}/>
                  Password Requirements:
                </Typography>
                <Typography variant="caption" component="ul" sx={{ ml: 3, pl: 0 }}>
                  <li>At least 8 characters</li>
                  <li>Not too common</li>
                  <li>A mix of letters, numbers, and symbols recommended</li>
                </Typography>
              </Box>
            </>
          )}

          <TextField
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            value={form.confirm_password}
            onChange={e => handleChange("confirm_password", e.target.value)}
            error={!!errors.confirm_password}
            helperText={errors.confirm_password?.join(", ")}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            size="large"
            sx={{ mt: 2, py: 1.2 }}
          >
            Create Account
          </Button>

          <Divider sx={{ my: 1 }}>or</Divider>

          <Button
            variant="outlined"
            onClick={() => nav("/login")}
            fullWidth
          >
            Back to Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
