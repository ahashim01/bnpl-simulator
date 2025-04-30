// src/components/layouts/DashboardLayout.tsx
import { useState, ReactNode, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Tooltip,
  Container,
  Zoom,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  CreditCard as CreditCardIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  HelpOutline as HelpOutlineIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/AuthContext";
import MobileBottomNav from "../molecules/MobileBottomNav";
interface DashboardLayoutProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 240;

export default function DashboardLayout({ children }: Readonly<DashboardLayoutProps>) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(isMdUp);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle drawer state based on screen size
  useEffect(() => {
    setOpen(isMdUp);
  }, [isMdUp]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // User menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  // Determine if menu item is active based on current path
  const isActive = (path: string) => location.pathname === path;

  // Lists for merchant and customer navigation
  const merchantListItems = (
    <>
      <ListItem sx={{ borderRadius: '8px', my: 0.5, mx: 1, p: 0 }}>
        <ListItemButton
          onClick={() => navigate("/")}
          selected={isActive("/")}
          sx={{
            borderRadius: '8px',
            color: isActive("/") ? 'primary.main' : 'text.primary',
            bgcolor: isActive("/") ? 'primary.light' : 'transparent',
            '&:hover': {
              bgcolor: isActive("/") ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive("/") ? 'primary.main' : 'text.secondary' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>

      <ListItem sx={{ borderRadius: '8px', my: 0.5, mx: 1, p: 0 }}>
        <ListItemButton
          onClick={() => navigate("/plans")}
          selected={isActive("/plans")}
          sx={{
            borderRadius: '8px',
            color: isActive("/plans") ? 'primary.main' : 'text.primary',
            bgcolor: isActive("/plans") ? 'primary.light' : 'transparent',
            '&:hover': {
              bgcolor: isActive("/plans") ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive("/plans") ? 'primary.main' : 'text.secondary' }}>
            <CreditCardIcon />
          </ListItemIcon>
          <ListItemText primary="Payment Plans" />
        </ListItemButton>
      </ListItem>

      <ListItem sx={{ borderRadius: '8px', my: 0.5, mx: 1, p: 0 }}>
        <ListItemButton
          onClick={() => navigate("/customers")}
          selected={isActive("/customers")}
          sx={{
            borderRadius: '8px',
            color: isActive("/customers") ? 'primary.main' : 'text.primary',
            bgcolor: isActive("/customers") ? 'primary.light' : 'transparent',
            '&:hover': {
              bgcolor: isActive("/customers") ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive("/customers") ? 'primary.main' : 'text.secondary' }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Customers" />
        </ListItemButton>
      </ListItem>
    </>
  );

  const customerListItems = (
    <>
      <ListItem sx={{ borderRadius: '8px', my: 0.5, mx: 1, p: 0 }}>
        <ListItemButton
          onClick={() => navigate("/")}
          selected={isActive("/")}
          sx={{
            borderRadius: '8px',
            color: isActive("/") ? 'primary.main' : 'text.primary',
            bgcolor: isActive("/") ? 'primary.light' : 'transparent',
            '&:hover': {
              bgcolor: isActive("/") ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive("/") ? 'primary.main' : 'text.secondary' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>

      <ListItem sx={{ borderRadius: '8px', my: 0.5, mx: 1, p: 0 }}>
        <ListItemButton
          onClick={() => navigate("/payment-history")}
          selected={isActive("/payment-history")}
          sx={{
            borderRadius: '8px',
            color: isActive("/payment-history") ? 'primary.main' : 'text.primary',
            bgcolor: isActive("/payment-history") ? 'primary.light' : 'transparent',
            '&:hover': {
              bgcolor: isActive("/payment-history") ? 'primary.light' : 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ color: isActive("/payment-history") ? 'primary.main' : 'text.secondary' }}>
            <CreditCardIcon />
          </ListItemIcon>
          <ListItemText primary="Payment History" />
        </ListItemButton>
      </ListItem>
    </>
  );

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: DRAWER_WIDTH,
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          boxShadow: "0 2px 10px 0 rgba(0,0,0,0.12)",
          backgroundColor: "white",
          color: "text.primary",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: 2,
              ...(open && { display: { md: "none" } }),
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="BNPL"
              sx={{
                height: 32,
                mr: 1,
                display: { xs: open ? "none" : "block", md: "block" }
              }}
            />
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              BNPL Payment System
            </Box>
          </Typography>

          {/* Notification icon */}
          <Tooltip title="Notifications" slots={{ transition: Zoom }}>
            <IconButton color="inherit" sx={{ mx: 1 }}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          {/* Help icon */}
          <Tooltip title="Help" slots={{ transition: Zoom }}>
            <IconButton color="inherit" sx={{ mx: 1 }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>

          {/* User profile */}
          <Tooltip title="Account settings" slots={{ transition: Zoom }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ p: 0, ml: 1 }}
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Avatar>
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant={isMdUp ? "permanent" : "temporary"}
        open={open}
        onClose={toggleDrawer}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            boxShadow: "2px 0 10px 0 rgba(0,0,0,0.05)",
            border: "none",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: [1],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Box component="img" src="/logo.png" alt="BNPL" sx={{ height: 32, mr: 1 }} />
            <Typography variant="h6" color="primary">BNPL System</Typography>
          </Box>

          {isMdUp && (
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Toolbar>

        <Divider />

        <Box sx={{ py: 2, px: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1, mb: 1 }}>
            <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
              {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" noWrap>
                {user?.username ?? 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user?.isMerchant ? "Merchant" : "Customer"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        <List sx={{ px: 1, py: 2 }}>
          {user?.isMerchant ? merchantListItems : customerListItems}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            BNPL Payment System v1.0
          </Typography>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          backgroundColor: "background.default",
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          pt: { xs: 8, md: 9 },
          px: { xs: 2, md: 4 },
          pb: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          {children}
        </Container>
      </Box>

      {isMobile && (
        <MobileBottomNav onCreatePlan={() => {
          // You can implement plan creation logic here or navigate to plan creation page
          navigate('/create-plan');
        }} />
      )}
    </Box>
  );
}
