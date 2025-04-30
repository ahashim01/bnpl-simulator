import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/AuthContext";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const MerchantDashboard = lazy(() => import("../pages/MerchantDashboard"));
const CustomerDashboard = lazy(() => import("../pages/CustomerDashboard"));
import NavBar from "../components/atoms/NavBar";

export default function AppRouter() {
  const { user } = useAuth();

  // Log user info for debugging
  useEffect(() => {
    if (user) {
      console.log("Current user:", user);
      console.log("Is merchant:", user.isMerchant);
    }
  }, [user]);

  // Determine which dashboard to show
  const getDashboard = () => {
    if (!user) return <Navigate to="/login" replace />;

    return user.isMerchant === true
      ? <MerchantDashboard />
      : <CustomerDashboard />;
  };

  return (
    <>
    {user && <NavBar />}
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/" element={getDashboard()} />
        <Route path="*" element={<Navigate to={user?"/":"/login"} replace/>}/>
      </Routes>
    </Suspense>
  </>
  );
}
