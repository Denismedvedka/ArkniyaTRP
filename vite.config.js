import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ВАЖНО: base должен совпадать с именем репозитория на GitHub.
// Если репозиторий называется arkniya-ttrpg, оставь как есть.
// Если назовёшь иначе — поменяй строку ниже на "/имя-репозитория/".
export default defineConfig({
  plugins: [react()],
  base: "/arkniya-ttrpg/",
});
