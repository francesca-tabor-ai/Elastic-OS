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
        sans: ["'Source Sans 3'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        foreground: {
          DEFAULT: "#0a0a0a",
          muted: "#525252",
          subtle: "#737373",
        },
        background: {
          DEFAULT: "#ffffff",
          alt: "#fafafa",
        },
        border: {
          DEFAULT: "#e5e5e5",
          subtle: "#f5f5f5",
        },
        surface: {
          DEFAULT: "#f5f5f5",
          hover: "#ebebeb",
        },
        accent: {
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
    },
  },
  plugins: [],
};

export default config;
