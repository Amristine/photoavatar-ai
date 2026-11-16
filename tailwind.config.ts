import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] },
      colors: {
        ink: "#09090d",
        panel: "#111117",
        line: "#252530",
        muted: "#9292a3",
        violet: { 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed" }
      },
      boxShadow: { glow: "0 0 50px rgba(139,92,246,.14)" }
    }
  },
  plugins: []
};
export default config;