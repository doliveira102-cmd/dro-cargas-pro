import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        surface: "#121A2B",
        surfaceRaised: "#182338",
        border: "#243049",
        borderSoft: "#1B2740",
        amber: "#F5A623",
        teal: "#2DD4BF",
        tealSoft: "#123531",
        success: "#34D399",
        danger: "#F87171",
        warn: "#FBBF24",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
