import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'DM Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        foreground: {
          DEFAULT: "#0f172a",
          muted: "#475569",
          subtle: "#64748b",
        },
        background: {
          DEFAULT: "#ffffff",
          alt: "#f8fafc",
        },
        border: {
          DEFAULT: "#e2e8f0",
          subtle: "#f1f5f9",
        },
        surface: {
          DEFAULT: "#f1f5f9",
          hover: "#e2e8f0",
        },
        accent: {
          DEFAULT: "#14b8a6",
          light: "#5eead4",
          dark: "#0d9488",
          yellow: "#facc15",
          green: "#22c55e",
          turquoise: "#14b8a6",
          blue: "#3b82f6",
        },
      },
      borderRadius: {
        ui: "0.75rem",
        "ui-sm": "0.5rem",
        "ui-lg": "1rem",
      },
      lineHeight: {
        headline: "1.15",
        body: "1.6",
        relaxed: "1.75",
      },
      backgroundImage: {
        "gradient-accent":
          "linear-gradient(135deg, #facc15 0%, #22c55e 35%, #14b8a6 60%, #0ea5e9 85%, #3b82f6 100%)",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
        soft: "0 2px 8px -2px rgb(0 0 0 / 0.05), 0 4px 16px -4px rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        scroll: "scroll 30s linear infinite",
        "fade-in": "fadeIn 0.3s cubic-bezier(0.33, 1, 0.68, 1) forwards",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        "ease-out-smooth": "cubic-bezier(0.33, 1, 0.68, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
