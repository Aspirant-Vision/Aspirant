import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aspirant Vision Strict Brand Colors
        'brand-red': '#E31E2B',
        'brand-red-hover': '#c91622',
        'brand-navy': '#171B52',
        'brand-navy-dark': '#0E1238',
        'brand-bg': '#F7F8FC',
        'brand-text': '#15182D',
        'brand-muted': '#687086',
        'brand-border': '#E7E9F0',

        // Primary Brand Colors
        primary: '#E31E2B',
        navy: '#171B52',
        'primary-light': '#ea444f',
        'primary-dark': '#b91c1c',
        'primary-container': '#171B52',
        'on-primary': '#ffffff',
        'on-primary-container': '#a0a8c2',

        // Secondary Brand Colors
        secondary: '#D4AF37',
        'secondary-light': '#e9c349',
        'secondary-dark': '#735c00',
        'secondary-container': '#fed65b',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#745c00',

        // Surface Colors
        surface: '#f8f9ff',
        'surface-bright': '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'surface-variant': '#d3e4fe',
        background: '#f8f9ff',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#44474e',
        'on-background': '#0b1c30',

        // Semantic Colors
        success: '#16A34A',
        error: '#ba1a1a',
        warning: '#f59e0b',
        info: '#3b82f6',

        // Additional UI Colors
        outline: '#74777e',
        'outline-variant': '#c4c6ce',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        'inverse-primary': '#b3c7ee',

        // Tertiary (optional)
        tertiary: '#001003',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#00290c',
        'on-tertiary-container': '#0a9f46',
      },
      spacing: {
        base: '4px',
        'stack-sm': '12px',
        'stack-md': '20px',
        'stack-lg': '40px',
        gutter: '32px',
        'margin-mobile': '20px',
        'margin-desktop': '48px',
        'section-gap': '100px',
        'container-max': '1280px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'display-lg': ['56px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-md': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'headline-sm': ['20px', { lineHeight: '1.3', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '700' }],
        'label-md': ['14px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '1.2', fontWeight: '500' }],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(11, 34, 64, 0.05)',
        'card-hover': '0 12px 30px rgba(11, 34, 64, 0.1)',
        'lg': '0 8px 40px rgba(11, 34, 64, 0.08)',
        'xl': '0 12px 60px rgba(11, 34, 64, 0.1)',
      },
      keyframes: {
        'pulse-green': {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 15px rgba(37, 211, 102, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-green': 'pulse-green 2s infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '100%',
          md: '728px',
          lg: '1024px',
          xl: '1280px',
        },
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
