import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8BB8F5",
          foreground: "#FFFFFF",
          50: "#F2F7FE",
          100: "#E5EFFD",
          200: "#CCDFFA",
          300: "#B2CFF8",
          400: "#99BFF5",
          500: "#8BB8F5",
          600: "#5C96E8",
          700: "#3674DB",
          800: "#2557B8",
          900: "#1A3F8C",
        },
        secondary: {
          DEFAULT: "#A5D5B3",
          foreground: "#FFFFFF",
          50: "#F4FAF6",
          100: "#E9F5ED",
          200: "#D4EBD9",
          300: "#BEE0C6",
          400: "#A9D6B3",
          500: "#A5D5B3",
          600: "#7DB98F",
          700: "#5C9D6E",
          800: "#457A53",
          900: "#2E5237",
        },
        accent: {
          DEFAULT: "#FFB5AC",
          foreground: "#FFFFFF",
          50: "#FFF4F2",
          100: "#FFE9E5",
          200: "#FFD3CC",
          300: "#FFBDB2",
          400: "#FFA799",
          500: "#FFB5AC",
          600: "#FF8576",
          700: "#FF5540",
          800: "#FF250A",
          900: "#D31700",
        },
        destructive: {
          DEFAULT: "#FFB5AC",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#B4B4B8",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "San Francisco", "Helvetica Neue", "sans-serif"],
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
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(8px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.98)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-out": "fade-out 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      margin: {
        'safe': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;