/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // App primary
        secondary: "#00F5D4", // Landing secondary
        "brand-bg": "#F8FAFC",
        "brand-text": "#1E293B",
        "workspace-bg": "#FFFFFF",
        "sidebar-light": "#F8FAFC",
      },
      fontFamily: {
        sans: ["Pretendard", "Noto Sans KR", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
}
