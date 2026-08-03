import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chainlistEmbedPlugin } from "./vite-plugins/chainlistEmbed";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), chainlistEmbedPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
