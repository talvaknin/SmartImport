import { heroui } from '@heroui/react'

// UMI Group corporate identity — blue/navy primary, semantic colors for status only.
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  // HeroUI applies these surface classes at RUNTIME (inside Card/Drawer/Modal/Toast),
  // so Tailwind's content scanner can't see them in our source and would skip
  // generating them — leaving those surfaces transparent. Safelisting forces them.
  safelist: [
    'bg-content1', 'bg-content2', 'bg-content3', 'bg-content4',
    'text-foreground', 'bg-background',
    'text-foreground-500', 'text-foreground-600',
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Heebo', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          blue: '#1F4E9D',
          navy: '#0B1F3A',
          surface: '#102A4C',
          bg: '#F4F7FB',
          panel: '#F8FAFC',
          border: '#D9E2EF',
          text: '#111827',
          muted: '#64748B',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,31,58,.05), 0 6px 18px rgba(11,31,58,.06)',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            // HeroUI "primary" now drives every default action → UMI Blue
            primary: {
              DEFAULT: '#1F4E9D',
              foreground: '#ffffff',
              50: '#eef3fb', 100: '#d8e3f5', 200: '#b3c8ea',
              300: '#8badde', 400: '#5683c4', 500: '#1F4E9D',
              600: '#1b4488', 700: '#163a73', 800: '#102a4c', 900: '#0b1f3a',
            },
            focus: '#1F4E9D',
            success: { DEFAULT: '#16A34A', foreground: '#ffffff' },
            warning: { DEFAULT: '#F59E0B', foreground: '#ffffff' },
            danger: { DEFAULT: '#DC2626', foreground: '#ffffff' },
          },
        },
      },
    }),
  ],
}
