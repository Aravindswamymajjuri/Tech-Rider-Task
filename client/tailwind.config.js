/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1320px"
      }
    },
    extend: {
      colors: {
        ink: {
          50: "#f6f7fb",
          100: "#eceff7",
          200: "#d2d8e7",
          300: "#a8b3cf",
          400: "#7587b0",
          500: "#4f6394",
          600: "#34487a",
          700: "#243460",
          800: "#172246",
          900: "#0c1530",
          950: "#070d22"
        },
        gold: {
          50: "#fbf7ec",
          100: "#f6ecca",
          200: "#ecd991",
          300: "#dec05a",
          400: "#cea735",
          500: "#b48a25",
          600: "#946c1d",
          700: "#74521b",
          800: "#5a401c",
          900: "#4b361c",
          950: "#2b1d0c"
        },
        sage: {
          50: "#f1f8f1",
          100: "#dfeede",
          200: "#bfdcbd",
          300: "#92c191",
          400: "#65a266",
          500: "#43844a",
          600: "#306838",
          700: "#27522e",
          800: "#214228",
          900: "#1c3622",
          950: "#0d1e12"
        },
        violet: {
          50: "#f4f3ff",
          100: "#ebe9fe",
          200: "#d9d4ff",
          300: "#bbb0ff",
          400: "#9683ff",
          500: "#7553ff",
          600: "#6532ff",
          700: "#5421ed",
          800: "#451dc6",
          900: "#3a1ba1",
          950: "#23106e"
        }
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 8px 30px rgba(7, 13, 34, 0.08)",
        ring: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(7, 13, 34, 0.25)",
        gold: "0 10px 30px rgba(180, 138, 37, 0.30)"
      },
      backgroundImage: {
        noise:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up .5s ease both"
      }
    }
  },
  plugins: []
};
