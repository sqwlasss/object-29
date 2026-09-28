/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  // Every `hover:` variant compiles to `@media (hover: hover)`, so hover-only
  // affordances never fire from a tap on a touch device — where they would
  // otherwise stick after the finger lifts. The system's shift and image-scale
  // motions both depend on this.
  future: { hoverOnlyWhenSupported: true },
  // Tailwind tree-shakes custom classes declared inside `@layer base`, keeping
  // only those it can see in `content`. The colour-field classes are applied
  // from data — a page's tone, `<Footer tone="vermilion" />` — so a scanner
  // looking for literal strings will not always find them, and a purged
  // `.o29-field--cobalt` fails silently as an unstyled bone page.
  //
  // Prefer a literal lookup map at the call site (`{ cobalt: 'o29-field--cobalt' }`)
  // so the names stay greppable; this safelist is the backstop that makes the
  // mechanism robust either way. It is a small fixed set, so the cost is a few
  // hundred bytes of CSS.
  safelist: [
    "o29-field",
    "o29-field--bone",
    "o29-field--ink",
    "o29-field--cobalt",
    "o29-field--vermilion",
    "o29-field--olive",
    "o29-field--sky",
    "o29-meta",
    "o29-hit",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			// --radius is 0rem, so calc(var(--radius) - 2px) would evaluate to an
  			// invalid negative length. sm/md are pinned to literal 0.
  			lg: 'var(--radius)',
  			md: '0px',
  			sm: '0px',
  			pill: '9999px'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},

  			// ── ØBJECT 29 raw brand ramp ────────────────────────────────────
  			// Channel triplets, so Tailwind opacity modifiers keep working
  			// (text-o29-ink/70, border-o29-rule/40).
  			o29: {
  				bone: 'hsl(var(--o29-bone) / <alpha-value>)',
  				'bone-2': 'hsl(var(--o29-bone-2) / <alpha-value>)',
  				rule: 'hsl(var(--o29-rule) / <alpha-value>)',
  				edge: 'hsl(var(--o29-edge) / <alpha-value>)',
  				slate: 'hsl(var(--o29-slate) / <alpha-value>)',
  				ink: 'hsl(var(--o29-ink) / <alpha-value>)',
  				cobalt: 'hsl(var(--o29-cobalt) / <alpha-value>)',
  				vermilion: 'hsl(var(--o29-vermilion) / <alpha-value>)',
  				ochre: 'hsl(var(--o29-ochre) / <alpha-value>)',
  				olive: 'hsl(var(--o29-olive) / <alpha-value>)',
  				sky: 'hsl(var(--o29-sky) / <alpha-value>)'
  			},

  			// ── Field-relative aliases ──────────────────────────────────────
  			// These resolve to whatever .o29-field--* is active on the nearest
  			// ancestor, so one set of classes styles chrome on bone, cobalt,
  			// vermilion, olive, ink and sky. No <alpha-value> support by
  			// design — use the o29 ramp above when you need opacity.
  			field: 'var(--bg)',
  			'field-fg': 'var(--fg)',
  			'field-muted': 'var(--fg-muted)',
  			hairline: 'var(--hairline)',
  			control: 'var(--control)',
  			focusring: 'var(--focus)',
  			mark: 'var(--mark)'
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		fontSize: {
  			// New names carry the editorial scale. `xs` deliberately does NOT
  			// set letter-spacing — tracking belongs on .o29-meta and on
  			// explicit tracking-* utilities, not on every text-xs in the app.
  			meta: ['var(--t-meta)', { lineHeight: 'var(--lh-meta)', letterSpacing: 'var(--tr-meta)' }],
  			xs: ['var(--t-xs)', { lineHeight: '1.2' }],
  			sm: ['var(--t-sm)', { lineHeight: '1.45' }],
  			base: ['var(--t-base)', { lineHeight: 'var(--lh-body)', letterSpacing: 'var(--tr-body)' }],
  			lead: ['var(--t-lead)', { lineHeight: 'var(--lh-lead)' }],
  			h3: ['var(--t-h3)', { lineHeight: 'var(--lh-h3)', letterSpacing: 'var(--tr-h3)' }],
  			h2: ['var(--t-h2)', { lineHeight: 'var(--lh-h2)', letterSpacing: 'var(--tr-h2)' }],
  			h1: ['var(--t-h1)', { lineHeight: 'var(--lh-h1)', letterSpacing: 'var(--tr-h1)' }],
  			display: ['var(--t-display)', { lineHeight: 'var(--lh-display)', letterSpacing: 'var(--tr-display)' }],
  			mega: ['var(--t-mega)', { lineHeight: 'var(--lh-mega)', letterSpacing: 'var(--tr-mega)' }]
  		},
  		spacing: {
  			gutter: 'var(--gutter)',
  			tight: 'var(--space-tight)',
  			quiet: 'var(--space-quiet)',
  			hold: 'var(--space-hold)',
  			header: 'var(--header-h)',
  			hit: 'var(--hit)'
  		},
  		maxWidth: {
  			page: 'var(--page-max)',
  			reading: '65ch',
  			lead: '48ch'
  		},
  		minHeight: {
  			field: '82svh',
  			'field-mobile': '100svh'
  		},
  		aspectRatio: {
  			plate: '4 / 5'
  		},
  		transitionDuration: {
  			instant: 'var(--dur-instant)',
  			shift: 'var(--dur-shift)',
  			curtain: 'var(--dur-curtain)',
  			reveal: 'var(--dur-reveal)',
  			scale: 'var(--dur-scale)'
  		},
  		transitionTimingFunction: {
  			room: 'var(--ease-room)',
  			shift: 'var(--ease-shift)',
  			curtain: 'var(--ease-curtain)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'rule-sweep': {
  				'0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
  				'50%': { transform: 'scaleX(1)', transformOrigin: 'left' },
  				'51%': { transform: 'scaleX(1)', transformOrigin: 'right' },
  				'100%': { transform: 'scaleX(0)', transformOrigin: 'right' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			// The loading indicator: a 1px rule sweeping the container, not a spinner.
  			'rule-sweep': 'rule-sweep 1.4s var(--ease-room) infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
