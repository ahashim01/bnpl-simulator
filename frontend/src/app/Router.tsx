import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/AuthContext";

// Lazy-loaded components
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const MerchantDashboard = lazy(() => import("../pages/MerchantDashboard"));
const CustomerDashboard = lazy(() => import("../pages/CustomerDashboard"));
import NavBar from "../components/atoms/NavBar";

// Loading component for Suspense fallback
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

export default function AppRouter() {
  const { user } = useAuth();
  const location = useLocation();

  // Log page navigation for analytics
  useEffect(() => {
    if (user) {
      console.log(`User ${user.username} navigated to ${location.pathname}`);
    }
  }, [location.pathname, user]);

  // Determine which dashboard to show based on user role
  const getDashboard = () => {
    if (!user) return <Navigate to="/login" replace />;
    return user.isMerchant ? <MerchantDashboard /> : <CustomerDashboard />;
  };

  return (
    <>
      {/* Only show NavBar when user is authenticated */}
      {user && <NavBar />}

      {/* Use Suspense for code-splitting */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Authentication routes */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" replace />}
          />

          {/* Protected dashboard route */}
          <Route path="/" element={getDashboard()} />

          {/* Catch-all route for 404s */}
          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/login"} replace />}
          />
        </Routes>
      </Suspense>
    </>
  );
}
