/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', '"Noto Sans SC"', "system-ui", "sans-serif"],
        han: ['"Noto Sans SC"', '"Microsoft YaHei"', "sans-serif"],
      },
      colors: {
        cream: "#fff8f5",
      },
      boxShadow: {
        card: "0 4px 20px -6px rgba(244, 63, 94, 0.18)",
      },
    },
  },
  plugins: [],
};
