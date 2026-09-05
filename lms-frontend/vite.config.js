import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "localhost",
    port: 5173,

    // Explicitly enable Hot Module Replacement
    hmr: true,

    // Useful on Linux when filesystem events are not detected correctly
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
