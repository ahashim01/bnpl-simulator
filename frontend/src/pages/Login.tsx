import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { useForm } from "../hooks/useForm";

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useForm<LoginForm>({
      initialValues: { username: "", password: "" },
      onSubmit: async (values) => {
        await login(values.username, values.password);
      },
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (!values.username) errors.username = "Username is required";
        if (!values.password) errors.password = "Password is required";
        return errors;
      },
    });

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          BNPL Demo Login
        </Typography>

        {authError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {authError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            label="Username"
            name="username"
            fullWidth
            value={values.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            margin="normal"
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={values.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
          <Button
            sx={{ mt: 2 }}
            fullWidth
            variant="contained"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>or</Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate("/register")}
        >
          Register New Account
        </Button>
      </Paper>
    </Container>
  );
}
