import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    ".flowbite-react\\class-list.json"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",

  plugins: [
    tailwindcss(),
    require('flowbite/plugin')
  ]

};


