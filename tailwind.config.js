/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,css}"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-noto-sans-kr)',
  				'system-ui'
  			],
  			'noto-sans-kr': [
  				'var(--font-noto-sans-kr)'
  			],
  			ghibli: ['Gowun Dodum', 'Noto Sans KR', 'sans-serif'],
  			bluebottle: ['Noto Sans KR', 'Inter', 'Apple SD Gothic Neo', 'sans-serif']
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			highlight: {
  				DEFAULT: '#F9E79F',
  				text: '#333333'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			ghibli: {
  				bg: '#f5f3e7',
  				card: '#fffaf3',
  				accent: '#a3c9a8',
  				yellow: '#f7d9a0',
  				purple: '#b7b5e4',
  				pink: '#e2b6b3',
  				text: '#4b4637',
  				text2: '#6b705c',
  				border: '#e6e6e6',
  				shadow: '#dbead5'
  			},
  			bluebottle: {
  				blue: '#0061a8',
  				bg: '#f7f7f7',
  				border: '#e5e5e5',
  				text: '#222'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: '1.5rem',
  			'3xl': '2rem'
  		},
  		spacing: {
  			'128': '32rem',
  			'144': '36rem'
  		},
  		screens: {
  			'3xl': '1920px'
  		},
  		maxHeight: {
  			'180': '180px'
  		}
  	}
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require('tailwind-scrollbar-hide'),  // scrollbar-hide 플러그인 추가
      require("tailwindcss-animate")
],
};