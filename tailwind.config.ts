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
        // Victory Martin brand system — Soft Red / White / Blue.
        // Softened, editorial tones for a light, elegant feel.
        brand: {
          red: {
            // Rose red — warmer, cleaner, less orange (client-selected #EB6A85)
            DEFAULT: "#EB6A85",
            50: "#FDF1F4",
            100: "#FBDDE4",
            200: "#F6BAC8",
            300: "#F196AB",
            400: "#EF8398",
            500: "#EB6A85",
            600: "#D9506E",
            700: "#B23A54",
            800: "#86293D",
            900: "#591B29",
          },
          blue: {
            // Deep ink navy — refined, restrained
            DEFAULT: "#1B3454",
            50: "#EEF2F8",
            100: "#D6E1EF",
            200: "#ABC1DE",
            300: "#7C9DC8",
            400: "#4E79AE",
            500: "#2F5987",
            600: "#1B3454",
            700: "#152B45",
            800: "#101F33",
            900: "#0A1523",
          },
          sky: "#6E9CC4", // supporting soft blue
          blush: "#F4E4DE", // warm accent wash
        },
        // Brass / champagne — premium metallic accent (nods to the wood finish)
        brass: {
          DEFAULT: "#A97F45",
          light: "#C6A06A",
          soft: "#D9C09A",
        },
        // Luxury minimalist neutrals — warm alabaster canvas, ink text
        ink: "#182838", // deep warm navy-charcoal text
        muted: "#61707F", // refined slate
        cream: "#F3ECDF", // warm light accent
        sand: "#F3ECDF",
        night: "#FBF9F4", // warm alabaster page canvas
        night2: "#F4EEE3", // warm greige alternate section
        panel: "#FFFFFF", // crisp white card surface
        panel2: "#EFE8DB", // elevated surface / hover
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.35rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,50,79,0.03), 0 10px 30px -16px rgba(23,50,79,0.10)",
        card: "0 1px 2px rgba(23,50,79,0.03), 0 6px 20px -14px rgba(23,50,79,0.09)",
        lift: "0 24px 64px -28px rgba(23,50,79,0.20)",
        glow: "0 10px 28px -12px rgba(235,106,133,0.40)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(70% 60% at 6% -8%, rgba(235,106,133,0.16) 0%, rgba(235,106,133,0) 62%), radial-gradient(65% 60% at 100% -6%, rgba(110,156,196,0.16) 0%, rgba(110,156,196,0) 60%)",
        "soft-fade": "linear-gradient(180deg, #0F1F33 0%, #0C1826 100%)",
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
