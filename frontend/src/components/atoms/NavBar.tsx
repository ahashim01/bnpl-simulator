import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import { useAuth } from "../../hooks/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();

  // Safely determine if the user is a merchant
  const isMerchant = user?.isMerchant === true;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>
          BNPL • {isMerchant ? "Merchant" : "Customer"}
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user.username && (
              <Typography variant="body2">
                Welcome, {user.username}
              </Typography>
            )}
            <Button color="inherit" onClick={logout}>Logout</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
