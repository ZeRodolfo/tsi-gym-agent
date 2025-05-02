/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@shadcn/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(153 27 27 / <alpha-value>)", // ou #991B1B
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B", // sua cor principal
          900: "#7F1D1D",
        },
        secondary: {
          DEFAULT: "#374151", // Cinza escuro
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151", // principal
          800: "#1F2937",
          900: "#111827",
        },
        success: {
          DEFAULT: "#16A34A", // green-600
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A", // DEFAULT
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        warning: {
          DEFAULT: "#D97706", // yellow-600
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706", // DEFAULT
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        error: {
          DEFAULT: "#DC2626", // red-600
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626", // DEFAULT
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
