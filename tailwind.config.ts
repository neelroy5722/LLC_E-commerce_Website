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
        // Victory Martin brand system — Light Red / White / Blue.
        // Clean neutral canvas with a warm light-red accent.
        brand: {
          red: {
            // Soft coral-red — clearly red (low blue value so it never reads pink)
            DEFAULT: "#E85A4F",
            50: "#FEF3F1",
            100: "#FCE1DD",
            200: "#F8C0B9",
            300: "#F39F95",
            400: "#F08276",
            500: "#E85A4F",
            600: "#CC4437",
            700: "#A8362B",
            800: "#7D2820",
            900: "#521A15",
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
          blush: "#FBEDEB", // soft red-tinted wash
        },
        // Muted slate accent — refined hairlines/overlines (replaces the tan brass)
        brass: {
          DEFAULT: "#7E8A99",
          light: "#9AA6B4",
          soft: "#C2CBD6",
        },
        // Clean neutral canvas — no tan/beige cast
        ink: "#182838", // deep navy-charcoal text
        muted: "#61707F", // refined slate
        cream: "#F2F4F7", // neutral light accent
        sand: "#F2F4F7",
        night: "#FCFCFD", // near-white page canvas
        night2: "#F5F6F8", // light neutral alternate section
        panel: "#FFFFFF", // crisp white card surface
        panel2: "#F0F2F5", // elevated surface / hover
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
        glow: "0 10px 28px -12px rgba(232,90,79,0.40)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(70% 60% at 6% -8%, rgba(232,90,79,0.16) 0%, rgba(232,90,79,0) 62%), radial-gradient(65% 60% at 100% -6%, rgba(110,156,196,0.16) 0%, rgba(110,156,196,0) 60%)",
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
