/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,astro}'],
  theme: {
    extend: {
      colors: {
        'theme-highlight': 'rgba(255, 191, 112, 0.35)',
        'tag-highlight': 'rgba(183, 105, 42, 0.52)',
        'tag-highlight-strong': 'rgba(163, 91, 33, 0.60)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: '500',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            h1: {
              color: 'inherit',
              fontWeight: '700',
            },
            h2: {
              color: 'inherit',
              fontWeight: '700',
            },
            h3: {
              color: 'inherit',
              fontWeight: '600',
            },
            h4: {
              color: 'inherit',
              fontWeight: '600',
            },
            code: {
              color: 'inherit',
              backgroundColor: 'var(--tw-prose-pre-bg)',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            pre: {
              backgroundColor: 'var(--tw-prose-pre-bg)',
              borderRadius: '0.375rem',
              padding: '1rem',
              overflowX: 'auto',
            },
          },
        },
        parchment: {
          css: {
            '--tw-prose-body': '#000000',
            '--tw-prose-headings': '#000000',
            '--tw-prose-lead': '#000000',
            '--tw-prose-links': '#68320f',
            '--tw-prose-bold': '#000000',
            '--tw-prose-counters': '#6f3715',
            '--tw-prose-bullets': '#6f3715',
            '--tw-prose-hr': 'rgba(109, 72, 41, 0.38)',
            '--tw-prose-quotes': '#000000',
            '--tw-prose-quote-borders': '#a66a36',
            '--tw-prose-captions': '#000000',
            '--tw-prose-kbd': '#000000',
            '--tw-prose-code': '#000000',
            '--tw-prose-pre-code': '#e1e4e8',
            '--tw-prose-pre-bg': 'rgba(166, 93, 36, 0.8)',
            '--tw-prose-th-borders': 'rgba(109, 72, 41, 0.5)',
            '--tw-prose-td-borders': 'rgba(109, 72, 41, 0.28)',
            color: '#000000',
            a: {
              color: '#68320f',
              fontWeight: '600',
              textDecorationColor: 'rgba(104, 50, 15, 0.5)',
              textUnderlineOffset: '0.16em',
              borderRadius: '0.2rem',
              paddingInline: '0.12rem',
              marginInline: '-0.12rem',
              transitionProperty: 'color, background-color, text-decoration-color',
              transitionDuration: '150ms',
              '&:hover': {
                color: '#3f1c08',
                backgroundColor: 'rgba(183, 105, 42, 0.22)',
                textDecorationColor: '#3f1c08',
              },
            },
            'h1 a, h2 a, h3 a, h4 a, h5 a, h6 a': {
              color: 'inherit',
              backgroundColor: 'transparent',
              paddingInline: '0',
              marginInline: '0',
              textDecoration: 'none',
            },
            blockquote: {
              color: '#000000',
              backgroundColor: 'rgba(255, 191, 112, 0.26)',
              borderLeftColor: '#a66a36',
              borderLeftWidth: '4px',
              borderRadius: '0 0.5rem 0.5rem 0',
              padding: '0.75rem 1rem',
              fontStyle: 'normal',
            },
            'ul > li::marker': {
              color: '#6f3715',
            },
            'ol > li::marker': {
              color: '#6f3715',
              fontWeight: '600',
            },
            code: {
              color: '#000000',
              backgroundColor: 'rgba(183, 105, 42, 0.16)',
              borderColor: 'rgba(166, 106, 54, 0.28)',
              borderWidth: '1px',
              borderRadius: '0.3rem',
              padding: '0.15rem 0.35rem',
              fontWeight: '500',
            },
            pre: {
              color: '#e1e4e8',
              backgroundColor: 'rgba(166, 93, 36, 0.8)',
              borderColor: 'rgba(125, 69, 29, 0.55)',
              borderWidth: '1px',
              borderRadius: '0.5rem',
              boxShadow: '0 8px 24px -18px rgba(45, 27, 16, 0.75)',
            },
            'pre code': {
              color: 'inherit',
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: 'inherit',
            },
            hr: {
              borderColor: 'rgba(109, 72, 41, 0.38)',
            },
            table: {
              color: '#000000',
            },
            thead: {
              backgroundColor: 'rgba(255, 191, 112, 0.16)',
            },
            th: {
              color: '#000000',
              borderBottomColor: 'rgba(109, 72, 41, 0.5)',
            },
            td: {
              borderBottomColor: 'rgba(109, 72, 41, 0.28)',
              borderBottomWidth: '1.5px',
            },
            'tbody tr': {
              transitionProperty: 'background-color',
              transitionDuration: '150ms',
            },
            'tbody tr:hover': {
              backgroundColor: 'rgba(255, 191, 112, 0.12)',
            },
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
