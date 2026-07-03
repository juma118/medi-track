/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  // MUI's CssBaseline handled the reset in the React app; here Angular Material's
  // theme owns global styling, so disable Tailwind's preflight to avoid conflicts.
  corePlugins: { preflight: false },
  theme: {
    extend: {},
  },
  plugins: [],
}
