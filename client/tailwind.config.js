/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        mint: "#34d399",
        violet: "#7c3aed",
        peach: "#fb7185",
      },
      boxShadow: {
        panel: "0 24px 80px rgba(15, 23, 42, 0.18)",
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.24), transparent 36%), radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.18), transparent 28%)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
