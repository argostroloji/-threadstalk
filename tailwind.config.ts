import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b12",
        panel: "#15151f",
        neon: "#c084fc",
        hot: "#f472b6",
        mint: "#34d399",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
