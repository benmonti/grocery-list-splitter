import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "/grocery-list-splitter/",
    build: {
        sourcemap: false,
    },
});
