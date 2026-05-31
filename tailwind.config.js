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
        darkbg: "#131313",
        cardbg: "#FFFFFF",
        darkcardbg: "#202020",
        txt: "#111827",
        mutedtxt: "#64748B",
        slate: {
          150: '#f1f5f9',
          250: '#cbd5e1',
          350: '#94a3b8',
          750: '#334155',
          850: '#1e293b',
        }
      },
      fontFamily: {
        sans: ["Sora", "Inter", "sans-serif"],
        poppins: ["Sora", "Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
