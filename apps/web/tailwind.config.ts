import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#EEF4FC",
          100: "#D8E7F8",
          200: "#A8C9F0",
          300: "#74A9E6",
          400: "#3C86DC",
          500: "#2065B6",
          600: "#1A5192",
          700: "#154175",
          800: "#0F3057",
          900: "#0A1F38"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#FEF6EC",
          100: "#FCE8CF",
          200: "#F9D19F",
          300: "#F6B565",
          400: "#F39E34",
          500: "#F2921B",
          600: "#D47B0C",
          700: "#AE650A",
          800: "#874E08",
          900: "#603806"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        neutral: {
          0: "#FFFFFF",
          50: "#F9FAFA",
          100: "#F1F2F3",
          200: "#E3E5E8",
          300: "#D0D3D7",
          400: "#9CA3AB",
          500: "#757F8A",
          600: "#596069",
          700: "#42474D",
          800: "#2A2E32",
          900: "#1A1C1E",
          950: "#0A0A0A"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      maxWidth: {
        site: "1200px"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
