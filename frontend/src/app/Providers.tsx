import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactNode } from "react";
import AuthProvider from "../hooks/AuthContext";

const client = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 } }, // 1 min cache
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
