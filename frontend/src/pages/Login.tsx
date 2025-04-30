import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
  } from "@mui/material";
  import { useState } from "react";
  import { useAuth } from "../hooks/AuthContext";

  export default function Login() {
    const { login } = useAuth();
    const [form, setForm] = useState({ username: "", password: "" });

    return (
      <Container maxWidth="xs" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            BNPL Demo Login
          </Typography>
          <TextField
            margin="normal"
            label="Username"
            fullWidth
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <TextField
            margin="normal"
            label="Password"
            type="password"
            fullWidth
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button
            sx={{ mt: 2 }}
            fullWidth
            variant="contained"
            onClick={() => login(form.username, form.password)}
          >
            Sign in
          </Button>
        </Paper>
      </Container>
    );
  }
