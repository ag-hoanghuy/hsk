import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Bind-mounted volumes on Windows don't emit fs events; poll instead.
    watch: { usePolling: true },
    proxy: {
      "/api": "http://backend:8000",
      "/audio": "http://backend:8000",
    },
  },
});
