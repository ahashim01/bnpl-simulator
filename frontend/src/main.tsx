import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./hooks/AuthContext";
import theme from "./theme";
import SuspenseFallback from "./components/molecules/SuspenseFallback";
import ErrorBoundary from "./components/molecules/ErrorBoundary";
import { ToastProvider } from "./components/molecules/ToastContainer";
import PageTransition from "./components/layouts/PageTransition";
import { createRoot } from "react-dom/client";
import Providers from "./app/Providers";

// Lazy load all pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MerchantDashboard = lazy(() => import("./pages/MerchantDashboard"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const MerchantPlans = lazy(() => import("./pages/MerchantPlans"));
const Customers = lazy(() => import("./pages/Customers"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PlanDetails = lazy(() => import("./pages/PlanDetails"));

// Route guards
interface ProtectedRouteProps {
  element: React.ReactElement;
  requireMerchant?: boolean;
}

function ProtectedRoute({
  element,
  requireMerchant = false
}: Readonly<ProtectedRouteProps>) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SuspenseFallback message="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireMerchant && !user.isMerchant) {
    return <Navigate to="/" replace />;
  }

  return element;
}

interface AuthRouteProps {
  element: React.ReactElement;
}

function AuthRoute({ element }: Readonly<AuthRouteProps>) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SuspenseFallback message="Loading..." />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return element;
}

function App() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <ErrorBoundary>
          <Suspense fallback={<SuspenseFallback />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Auth routes */}
                <Route
                  path="/login"
                  element={
                    <AuthRoute
                      element={
                        <PageTransition>
                          <Login />
                        </PageTransition>
                      }
                    />
                  }
                />
                <Route
                  path="/register"
                  element={
                    <AuthRoute
                      element={
                        <PageTransition>
                          <Register />
                        </PageTransition>
                      }
                    />
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute
                      element={
                        <PageTransition>
                          {user?.isMerchant ? <MerchantDashboard /> : <CustomerDashboard />}
                        </PageTransition>
                      }
                    />
                  }
                />

                {/* Merchant routes */}
                <Route
                  path="/plans/:planId"
                  element={
                    <ProtectedRoute
                      requireMerchant
                      element={
                        <PageTransition>
                          <PlanDetails />
                        </PageTransition>
                      }
                    />
                  }
                />

                <Route
                  path="/plans"
                  element={
                    <ProtectedRoute
                      requireMerchant
                      element={
                        <PageTransition>
                          <MerchantPlans />
                        </PageTransition>
                      }
                    />
                  }
                />

                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute
                      requireMerchant
                      element={
                        <PageTransition>
                          <Customers />
                        </PageTransition>
                      }
                    />
                  }
                />

                <Route
                  path="*"
                  element={
                    <PageTransition>
                      <NotFound />
                    </PageTransition>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

// Mount the App component to the DOM
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
