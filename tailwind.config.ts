import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#242424",
        paper: "#f7f5ef",
        mist: "#e8e3d8",
        clay: "#b68867",
        sage: "#8b9a88",
        graphite: "#515151",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(36, 36, 36, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
