import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        green: {
          50: "var(--green-50)",
          100: "var(--green-100)",
          200: "var(--green-200)",
          300: "var(--green-300)",
          500: "var(--green-500)",
          600: "var(--green-600)",
          700: "var(--green-700)",
        },
        ink: {
          400: "var(--ink-400)",
          500: "var(--ink-500)",
          600: "var(--ink-600)",
          700: "var(--ink-700)",
          900: "var(--ink-900)",
        },
        amber: {
          50: "var(--amber-50)",
          100: "var(--amber-100)",
          600: "var(--amber-600)",
        },
        red: {
          100: "var(--red-100)",
          500: "var(--red-500)",
          600: "var(--red-600)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
