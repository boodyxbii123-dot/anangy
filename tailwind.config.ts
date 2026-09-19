import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#051D41",
          50: "#EEF1F6",
          100: "#DCE3EC",
          200: "#B4C1D6",
          300: "#8C9FC0",
          400: "#5E729B",
          500: "#324873",
          600: "#0F2E5C",
          700: "#051D41",
          800: "#04162F",
          900: "#020D1D",
        },
        paper: "#FFFFFF",
        mist: "#F6F7F9",
        line: "#E7E9EE",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(5, 29, 65, 0.04), 0 8px 24px rgba(5, 29, 65, 0.05)",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
