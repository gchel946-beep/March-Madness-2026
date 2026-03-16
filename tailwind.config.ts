import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0d1117",
        s1: "#161b22",
        s2: "#21262d",
        s3: "#2d333b",
        br: "#30363d",
        br2: "#444c56",
        tx: "#e6edf3",
        tx2: "#adbac7",
        tx3: "#768390",
        blue: "#4493f8",
        blue2: "#1f6feb",
        grn: "#3fb950",
        red: "#f85149",
        gld: "#d29922",
        purple: "#bc8cff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
