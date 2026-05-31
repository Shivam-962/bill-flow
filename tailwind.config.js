/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--secondary-color)",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "var(--accent-color)",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        slatebg: "#F8FAFC",
        darkbg: "#0F172A",
        cardbg: "#FFFFFF",
        darkcardbg: "#1E293B",
        txt: "#111827",
        mutedtxt: "#64748B"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
