import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },      // avoids random port changes
  envPrefix: "VITE_",                            // whitelist
});
