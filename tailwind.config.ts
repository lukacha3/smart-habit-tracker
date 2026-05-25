import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Activa el modo oscuro manual por clases
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Nord Theme
        nord: {
          0: "#2E3440", // Fondo principal oscuro
          1: "#3B4252", // Fondo secundario / Tarjetas
          2: "#434C5E", // Hover / Selecciones
          3: "#4C566A", // Textos muteados / Bordes
          4: "#D8DEE9", // Texto principal claro
          5: "#E5E9F0", // Texto secundario claro
          6: "#ECEFF4", // Texto destacado claro
          7: "#8FBCBB", // Acento verde-cyan
          8: "#88C0D0", // Acento azul claro
          9: "#81A1C1", // Acento azul medio
          10: "#5E81AC", // Acento azul oscuro (Botones principales)
          11: "#BF616A", // Rojo (Errores / Borrar)
          12: "#D08770", // Naranja (Advertencias)
          13: "#EBCB8B", // Amarillo
          14: "#A3BE8C", // Verde (Éxito / Pomodoro)
          15: "#B48EAD", // Púrpura
        },
      },
    },
  },
  plugins: [],
};
export default config;