/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "login-bg": "url('../public/login.jpg')",
      },
      gridTemplateColumns: {
        fluid: "repeat(auto-fit, minmax(20rem, 1fr))",
      },
      animation: {
        bounceLeft: "bounce 1s infinite",
        bounceCenter: "bounce 1s 0.2s infinite",
        bounceRight: "bounce 1s 0.4s infinite",
      },
    },
  },
  plugins: [],
}
