import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Barlow"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        roboto: ['"Barlow"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        // Display face for headlines and big numbers (spec 5.2).
        brand: ['"Barlow Condensed"', '"Barlow"', "system-ui", "sans-serif"],
        // Body copy used font-serif throughout; it now maps to the same family as the UI.
        serif: ['"Barlow"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        quote: ["Georgia", "serif"],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        grow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "rise-in": "rise-in 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        float: "float 6s ease-in-out infinite",
        grow: "grow 2.4s cubic-bezier(0.2, 0.7, 0.2, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: [
      {
        // Original Athylift blue as primary, navy surfaces, orange as a small accent.
        light: {
          "primary": "#0077B5",
          "primary-content": "#FFFFFF",
          "secondary": "#1C3366",
          "secondary-content": "#FFFFFF",
          "accent": "#FF6B1A",
          "accent-content": "#16202E",
          "neutral": "#0F1E3D",
          "neutral-content": "#FFFFFF",
          "base-100": "#FFFFFF",
          "base-200": "#EEF2F7",
          "base-300": "#D5DCE6",
          "base-content": "#16202E",
          "info": "#2563EB",
          "success": "#1F9D55",
          "success-content": "#FFFFFF",
          "warning": "#F59E0B",
          "error": "#DC2626",
        },
        dark: {
          "primary": "#0A84C2",
          "primary-content": "#FFFFFF",
          "secondary": "#3B5BA9",
          "secondary-content": "#FFFFFF",
          "accent": "#FF8A4C",
          "accent-content": "#0B1220",
          "neutral": "#E6EBF2",
          "neutral-content": "#0B1220",
          "base-100": "#111A2E",
          "base-200": "#0B1220",
          "base-300": "#25324F",
          "base-content": "#E6EBF2",
          "info": "#60A5FA",
          "success": "#34D399",
          "success-content": "#0B1220",
          "warning": "#FBBF24",
          "error": "#F87171",
        },
        sport: {
          "primary": "#DA020E", // Monza red
          "secondary": "#0066CC", // Science Blue
          "accent": "#48494A", // Abbey Gray
          "neutral": "#000000",
          "base-100": "#FFFFFF",
          "base-200": "#F5F5F5",
          "base-300": "#48494A",
          "base-content": "#000000",
          "info": "#0066CC",
          "success": "#DA020E",
          "warning": "#48494A",
          "error": "#D32F2F",
        },
      },
    ],
  },
} satisfies Config;
