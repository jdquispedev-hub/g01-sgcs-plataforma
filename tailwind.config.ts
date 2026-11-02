import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta Institucional Inspirada en UPT (Universidad Privada de Tacna)
        upt: {
          navy: {
            DEFAULT: '#0B2545', // Azul profundo institucional
            50: '#F0F4F8',
            100: '#D9E2EC',
            500: '#134074',
            600: '#0B2545',
            700: '#081C33',
            800: '#051322',
            900: '#020A12',
          },
          gold: {
            DEFAULT: '#C59B27', // Dorado Oro insignia
            50: '#FDFBF7',
            100: '#FBF4E4',
            200: '#F5E4B9',
            300: '#EFD48E',
            400: '#E4BF56',
            500: '#C59B27',
            600: '#A37C1A',
            700: '#7A5B10',
          },
          garnet: {
            DEFAULT: '#7B1113', // Granate Tacneño
            50: '#FAF0F0',
            100: '#F3D6D7',
            500: '#7B1113',
            600: '#630D0F',
          }
        }
      },
    },
  },
  plugins: [],
};
export default config;
