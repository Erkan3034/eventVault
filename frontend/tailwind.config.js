/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            // ── Mirra Brand Colors ─────────────────────────────────
            colors: {
                // Navy — güven, kalıcılık
                navy: {
                    DEFAULT: '#1A2340',
                    light: '#243058',
                    dark:  '#111827',
                },
                // Antik Altın — lüks, özellik, anı
                gold: {
                    DEFAULT: '#B8975A',
                    light:   '#D4B07A',
                    dark:    '#8A6E3A',
                },
                // Krem — sıcaklık, nostalji
                cream: {
                    DEFAULT: '#FDF8F0',
                    dark:    '#F5EDDF',
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
                'gold-sm': '0 2px 8px 0 rgba(184,151,90,0.20)',
                'gold':    '0 4px 20px 0 rgba(184,151,90,0.35)',
                'gold-lg': '0 8px 40px 0 rgba(184,151,90,0.45)',
                'navy':    '0 4px 24px 0 rgba(26,35,64,0.25)',
            },

            // ── Animations ────────────────────────────────────────
            animation: {
                'fade-in':    'fadeIn 0.5s ease-in-out',
                'slide-up':   'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'slide-left': 'slideLeft 0.35s ease-out',
                'pulse-gold': 'pulseGold 2s ease-in-out infinite',
                'float':      'float 3s ease-in-out infinite',
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
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(184,151,90,0.5)' },
                    '50%':      { boxShadow: '0 0 0 10px rgba(184,151,90,0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%':      { transform: 'translateY(-8px)' },
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