/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
  "./src/app/**/*.{js,jsx,ts,tsx}",
  "./src/**/*.{js,jsx,ts,tsx}", // catches src/app/components etc.
],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}