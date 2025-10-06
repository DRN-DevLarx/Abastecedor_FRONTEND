/** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
      "node_modules/flowbite/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      screens: {
        xs: ['200px'],
      },
      
      extend: {},
    },
    darkMode: "class", //
    plugins: [
      require("flowbite/plugin"),
    ],
  };
