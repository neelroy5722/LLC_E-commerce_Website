import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // Palette — combination 1: brown text / cream background / gold buttons.
        // Words #3B1E08 · Background #E3DAC9 · Buttons #F5CC00
        brand: {
          red: {
            // Accent gold — buttons, highlights, badges. Light shades are bright
            // gold (fills, tints); dark shades are deep gold (readable as text).
            DEFAULT: "#F5CC00",
            50: "#FEFBE9",
            100: "#FCF3C2",
            200: "#F9E680",
            300: "#F5D93B",
            400: "#F5CC00",
            500: "#E4BD00",
            600: "#C29E00",
            700: "#8A6E00",
            800: "#5E4B00",
            900: "#3B2F00",
          },
          blue: {
            // Deep brown — primary text, dark UI bands, hairline borders.
            DEFAULT: "#3B1E08",
            50: "#F5EFE6",
            100: "#E9DAC7",
            200: "#D3BB98",
            300: "#B4915F",
            400: "#8A6636",
            500: "#5C3D18",
            600: "#3B1E08",
            700: "#301906",
            800: "#241205",
            900: "#180B02",
          },
          sky: "#B4863C", // warm supporting amber
          blush: "#FBF3D6", // soft gold wash
        },
        // Warm taupe accent — refined hairlines/overlines
        brass: {
          DEFAULT: "#8B7B63",
          light: "#A99A80",
          soft: "#CFC3AD",
        },
        // Warm cream canvas with deep-brown text
        ink: "#3B1E08", // deep brown text
        muted: "#7A6A52", // muted warm brown
        cream: "#EDE6D6", // warm light accent
        sand: "#E3DAC9",
        night: "#E3DAC9", // page canvas (background)
        night2: "#EDE6D6", // warm alternate section
        panel: "#FFFFFF", // crisp white card surface
        panel2: "#F3EEE2", // elevated warm surface / hover
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.35rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(59,30,8,0.04), 0 10px 30px -16px rgba(59,30,8,0.12)",
        card: "0 1px 2px rgba(59,30,8,0.04), 0 6px 20px -14px rgba(59,30,8,0.10)",
        lift: "0 24px 64px -28px rgba(59,30,8,0.22)",
        glow: "0 10px 28px -12px rgba(245,204,0,0.45)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(70% 60% at 6% -8%, rgba(245,204,0,0.18) 0%, rgba(245,204,0,0) 62%), radial-gradient(65% 60% at 100% -6%, rgba(180,134,60,0.16) 0%, rgba(180,134,60,0) 60%)",
        "soft-fade": "linear-gradient(180deg, #2A1606 0%, #180B02 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.8s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
