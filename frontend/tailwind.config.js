/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            // ── Mirra Brand Colors ─────────────────────────────────
            colors: {
                navy: {
                    DEFAULT: '#1A2748',
                    light: '#2A3868',
                    dark:  '#111827',
                },
                gold: {
                    DEFAULT: '#C4A05F',
                    light:   '#D9B87E',
                    dark:    '#93753C',
                },
                cream: {
                    DEFAULT: '#FEF9F2',
                    dark:    '#F6EDDF',
                },
            },

            // ── Typography ────────────────────────────────────────
            fontFamily: {
                display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
                sans:    ['"DM Sans"', 'ui-sans-serif', 'system-ui'],
                mono:    ['"JetBrains Mono"', 'monospace'],
            },

            // ── Spacing extras ────────────────────────────────────
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },

            // ── Border radius ─────────────────────────────────────
            borderRadius: {
                '4xl': '2rem',
            },

            // ── Box shadow ────────────────────────────────────────
            boxShadow: {
                'gold-sm': '0 2px 8px 0 rgba(196,160,95,0.24)',
                'gold':    '0 4px 20px 0 rgba(196,160,95,0.38)',
                'gold-lg': '0 8px 40px 0 rgba(196,160,95,0.46)',
                'navy':    '0 4px 24px 0 rgba(26,39,72,0.25)',
            },

            // ── Animations ────────────────────────────────────────
            animation: {
                'fade-in':    'fadeIn 0.5s ease-in-out',
                'slide-up':   'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'slide-left': 'slideLeft 0.35s ease-out',
                'pulse-gold': 'pulseGold 2s ease-in-out infinite',
                'float':      'float 3s ease-in-out infinite',
                'float-slow': 'float 7s ease-in-out infinite',
                'ken-burns':  'kenBurns 22s ease-in-out infinite alternate',
                'spin-slow':  'spin 3s linear infinite',
                'heart-pop':  'heartPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                'confetti':   'confettiFall 1s ease-out forwards',
            },

            keyframes: {
                fadeIn: {
                    '0%':   { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%':   { transform: 'translateY(16px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)',    opacity: '1' },
                },
                slideDown: {
                    '0%':   { transform: 'translateY(-16px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)',     opacity: '1' },
                },
                slideLeft: {
                    '0%':   { transform: 'translateX(24px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)',    opacity: '1' },
                },
                pulseGold: {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(196,160,95,0.5)' },
                    '50%':      { boxShadow: '0 0 0 10px rgba(196,160,95,0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%':      { transform: 'translateY(-8px)' },
                },
                kenBurns: {
                    '0%':   { transform: 'scale(1) translate(0, 0)' },
                    '100%': { transform: 'scale(1.08) translate(-1.5%, -1%)' },
                },
                heartPop: {
                    '0%':   { transform: 'scale(1)' },
                    '50%':  { transform: 'scale(1.4)' },
                    '100%': { transform: 'scale(1)' },
                },
                confettiFall: {
                    '0%':   { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'translateY(60px)  rotate(360deg)', opacity: '0' },
                },
            },

            // ── Backdrop blur ─────────────────────────────────────
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}