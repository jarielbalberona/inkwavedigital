import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  envDir: path.resolve(__dirname, "../../"), // Use root .env file
  plugins: [
    react(), 
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          tanstack: ["@tanstack/react-query", "@tanstack/react-router"],
        },
      },
    },
  },
  define: {
    // Ensure environment variables are available at build time
    "process.env.VITE_API_BASE_URL": JSON.stringify(process.env.VITE_API_BASE_URL),
  },
});

