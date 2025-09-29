/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { container: { center: true, padding: "1rem" } } },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")]
};
