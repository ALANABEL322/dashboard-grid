import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/presentation": path.resolve(__dirname, "./src/presentation"),
      "@/domain": path.resolve(__dirname, "./src/domain"),
      "@/application": path.resolve(__dirname, "./src/application"),
      "@/infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@/widgets": path.resolve(
        __dirname,
        "./src/presentation/components/grid/widgets"
      ),
    },
  },
});
