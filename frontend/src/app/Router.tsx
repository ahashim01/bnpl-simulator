import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../hooks/AuthContext";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const MerchantDashboard = lazy(() => import("../pages/MerchantDashboard"));
const CustomerDashboard = lazy(() => import("../pages/CustomerDashboard"));
import NavBar from "../components/atoms/NavBar";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <>
    {user && <NavBar />}
    <Suspense fallback={<CircularProgress sx={{ m:4 }}/>}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
        {user?.isMerchant && <Route path="/" element={<MerchantDashboard/>}/>}
        {user && !user.isMerchant && <Route path="/" element={<CustomerDashboard/>}/>}
        <Route path="*" element={<Navigate to={user?"/":"/login"} replace/>}/>
      </Routes>
    </Suspense>
  </>
  );
}
