import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { useForm } from "../hooks/useForm";
import { loginSchema } from "../utils/validation";
// Using direct JSX import as a workaround for module resolution issues
import LogoIcon from "../components/atoms/LogoIcon";

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useForm<LoginForm>({
      initialValues: { username: "", password: "" },
      validationSchema: loginSchema,
      onSubmit: async (values: LoginForm) => {
        await login(values.username, values.password);
      },
    });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={isMobile ? 0 : 3}
          sx={{
            p: isMobile ? 2 : 4,
            borderRadius: 2,
            backgroundColor: isMobile ? "transparent" : "background.paper",
            boxShadow: isMobile ? "none" : undefined,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <LogoIcon size={48} />
          </Box>

          <Typography variant="h5" align="center" gutterBottom fontWeight={600}>
            Sign in to BNPL
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Enter your credentials to access your account
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
              autoComplete="username"
              autoFocus
              variant="filled"
              sx={{ mb: 2 }}
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
              autoComplete="current-password"
              variant="filled"
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              size="large"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/register")}
            size="large"
          >
            Create New Account
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
