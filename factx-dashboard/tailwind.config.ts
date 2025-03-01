import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(220, 14%, 96%)", // Soft gray-white
        foreground: "hsl(220, 10%, 20%)", // Dark gray for contrast
        card: {
          DEFAULT: "hsl(0, 0%, 100%)", // Pure white
          foreground: "hsl(220, 10%, 20%)",
        },
        popover: {
          DEFAULT: "hsl(220, 14%, 94%)",
          foreground: "hsl(220, 10%, 20%)",
        },
        primary: {
          DEFAULT: "hsl(220, 90%, 55%)", // Muted blue for a clean, modern look
          foreground: "hsl(0, 0%, 100%)",
        },
        secondary: {
          DEFAULT: "hsl(220, 14%, 85%)", // Soft neutral
          foreground: "hsl(220, 10%, 20%)",
        },
        muted: {
          DEFAULT: "hsl(220, 14%, 80%)", // Subtle gray
          foreground: "hsl(220, 10%, 30%)",
        },
        accent: {
          DEFAULT: "hsl(160, 40%, 45%)", // Muted teal for a slight pop of color
          foreground: "hsl(0, 0%, 100%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 70%, 50%)", // Soft red for warnings
          foreground: "hsl(0, 0%, 100%)",
        },
        border: "hsl(220, 14%, 80%)",
        input: "hsl(220, 14%, 90%)",
        ring: "hsl(220, 90%, 55%)",
        chart: {
          "1": "hsl(220, 60%, 60%)",
          "2": "hsl(160, 40%, 50%)",
          "3": "hsl(40, 80%, 50%)",
          "4": "hsl(0, 60%, 50%)",
          "5": "hsl(280, 50%, 60%)",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

