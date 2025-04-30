import { Container, Paper, TextField, Button, Typography, Stack } from "@mui/material";
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [form, set] = useState({ username: "", password: "", is_merchant: false });

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>Sign Up</Typography>
        <Stack spacing={2}>
          <TextField label="Username" value={form.username} onChange={e=>set({...form, username:e.target.value})}/>
          <TextField type="password" label="Password" value={form.password} onChange={e=>set({...form, password:e.target.value})}/>
          <Button variant={form.is_merchant?"contained":"outlined"} onClick={()=>set({...form,is_merchant:!form.is_merchant})}>
            {form.is_merchant ? "Registering as Merchant" : "Registering as Customer"}
          </Button>
          <Button variant="contained" onClick={async ()=>{
            await api.post("/register/", form);
            nav("/login");
          }}>Create account</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
