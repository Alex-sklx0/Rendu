import type { Config } from "tailwindcss";

// Design tokens — PLACEHOLDER palette until real Figma references are provided.
// See .agents/skills/rendu-frontend/SKILL.md → "Visual direction — waiting on Figma".
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#16211A", // near-black, greenish tint (not flat #111)
          700: "#2C3A30",
          500: "#5B6B5E",
          300: "#9BA89D",
        },
        surface: {
          50: "#F6F5F0", // warm paper, slightly greyed to avoid the generic cream tell
          100: "#EDEBE2",
          200: "#DFDCCF",
        },
        forest: {
          600: "#2F5233",
          700: "#25412A",
          800: "#1C3320",
        },
        clay: {
          400: "#C98B3B",
          500: "#B67428",
          600: "#96601F",
        },
        signal: {
          error: "#B3432B",
          success: "#3E7A45",
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
} satisfies Config;
