/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "custom-frame": "12px 12px 12px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.06)",
        "deep-glow": "0 10px 15px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.1)",
        "inset-light": "inset 0 4px 20px rgba(0, 0, 0, 1)",
      },
      fontFamily: {
        rouge : ["Rouge Script", "serif"],
      },
    },
  },
  plugins: [],
}

