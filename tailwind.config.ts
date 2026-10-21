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
        sans: ['"Roboto"', "ui-sans-serif", "system-ui", "sans-serif"],
        roboto: ['"Roboto"', "ui-sans-serif", "system-ui", "sans-serif"],
        brand: ['"Avenir Black"', '"Avenir Next Heavy"', '"Avenir Next"', "sans-serif"],
        serif: ['"Source Serif 4"', "Georgia", "serif"],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#0077B5",
          "secondary": "#00A0DC",
          "accent": "#313335",
          "neutral": "#000000",
          "base-100": "#CACCCE",
          "base-200": "#86888A",
          "base-300": "#313335",
          "base-content": "#000000",
          "info": "#00A0DC",
          "success": "#0077B5",
          "warning": "#86888A",
          "error": "#D32F2F",
        },
        dark: {
          "primary": "#00A0DC",
          "secondary": "#0077B5",
          "accent": "#86888A",
          "neutral": "#CACCCE",
          "base-100": "#000000",
          "base-200": "#313335",
          "base-300": "#86888A",
          "base-content": "#CACCCE",
          "info": "#00A0DC",
          "success": "#0077B5",
          "warning": "#86888A",
          "error": "#D32F2F",
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
