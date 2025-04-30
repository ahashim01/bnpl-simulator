import { useState, useEffect } from "react";
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useTheme,
  Zoom,
  Fab,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  CreditCard as CreditCardIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";

interface MobileBottomNavProps {
  onCreatePlan?: () => void;
}

export default function MobileBottomNav({ onCreatePlan }: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [value, setValue] = useState(0);

  const isMerchant = user?.isMerchant;

  // Update navigation value based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setValue(0);
    } else if (path === "/plans" || path === "/payment-history") {
      setValue(1);
    } else if (path === "/customers") {
      setValue(2);
    }
  }, [location.pathname]);

  // Merchant navigation items
  const merchantNavItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { label: "Plans", icon: <CreditCardIcon />, path: "/plans" },
    { label: "Customers", icon: <PersonIcon />, path: "/customers" },
  ];

  // Customer navigation items
  const customerNavItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { label: "History", icon: <CreditCardIcon />, path: "/payment-history" },
  ];

  const navItems = isMerchant ? merchantNavItems : customerNavItems;

  return (
    <Box sx={{ pb: 7 }}>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        }}
        elevation={3}
      >
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            navigate(navItems[newValue].path);
          }}
          showLabels
        >
          {navItems.map((item, index) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>

      {/* Floating action button for creating plans (merchants only) */}
      {isMerchant && onCreatePlan && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="Create Plan"
            onClick={onCreatePlan}
            sx={{
              position: "fixed",
              bottom: 76,
              right: 16,
              zIndex: 1001,
            }}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
}
