import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      maxWidth: {
        "8xl": "90rem", // 1440px
        "9xl": "100rem", // 1600px
      },
      colors: {
        obsidian: {
          950: "#07080a",
          900: "#0c0d12",
          850: "#11131a",
          800: "#171922",
          700: "#222530",
          600: "#323644",
        },
        zyvoriq: {
          emerald: "#10b981",
          teal: "#14b8a6",
          cyan: "#06b6d4",
          violet: "#6366f1",
          amber: "#f59e0b",
          coral: "#ff5a36",
          acid: "#d8ff55",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "glow-slow": "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glow: {
          "0%": { opacity: "0.4", filter: "blur(20px)" },
          "100%": { opacity: "0.8", filter: "blur(28px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
