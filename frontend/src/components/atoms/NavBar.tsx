import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from "@mui/material";
import { useAuth } from "../../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Safely determine if the user is a merchant
  const isMerchant = user?.isMerchant === true;

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{
      background: 'white',
      color: 'text.primary',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Toolbar>
        <IconButton
          color="primary"
          onClick={handleHomeClick}
          sx={{ mr: 1 }}
        >
          <HomeIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500, color: 'primary.main' }}>
          BNPL • {isMerchant ? "Merchant" : "Customer"} Dashboard
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user.username && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: isMerchant ? 'primary.main' : 'success.main',
                    mr: 1
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2">
                  {user.username}
                </Typography>
              </Box>
            )}
            <Button
              color="primary"
              variant="outlined"
              onClick={logout}
              size="small"
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
