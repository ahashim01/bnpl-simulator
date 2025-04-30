import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useAuth } from "../../hooks/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>
          BNPL • {user?.is_merchant ? "Merchant" : "Customer"}
        </Typography>
        {user && <Button color="inherit" onClick={logout}>Logout</Button>}
      </Toolbar>
    </AppBar>
  );
}
