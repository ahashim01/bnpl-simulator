import React from "react";
import ReactDOM from "react-dom/client";
import Providers from "./app/Providers";
import AppRouter from "./app/Router";
import CssBaseline from "@mui/material/CssBaseline";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <Providers>
      <AppRouter />
    </Providers>
  </React.StrictMode>
);
