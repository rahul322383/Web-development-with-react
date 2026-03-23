// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5",
          foreground: "#FFFFFF",
          hover: "#4338CA",
          active: "#3730A3"
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
          hover: "#E2E8F0"
        },
        background: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC",
          dark: "#0F172A"
        },
        surface: {
          DEFAULT: "#FFFFFF",
          elevated: "#FFFFFF",
          overlay: "rgba(255, 255, 255, 0.8)"
        },
        border: {
          DEFAULT: "#E2E8F0",
          subtle: "#F1F5F9",
          strong: "#CBD5E1"
        },
        text: {
          primary: "#0F172A",
          secondary: "#64748B",
          muted: "#94A3B8",
          inverse: "#FFFFFF"
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};