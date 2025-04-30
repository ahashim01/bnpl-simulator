import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../hooks/AuthContext";

const Login = lazy(() => import("../pages/Login"));
const MerchantPlans = lazy(() => import("../pages/MerchantPlans"));
const UserDashboard = lazy(() => import("../pages/UserDashboard"));

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<CircularProgress sx={{ m: 4 }} />}>
      <Routes>
        {!user && <Route path="/login" element={<Login />} />}
        {user?.isMerchant && <Route path="/" element={<MerchantPlans />} />}
        {user && !user.isMerchant && <Route path="/" element={<UserDashboard />} />}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
}
