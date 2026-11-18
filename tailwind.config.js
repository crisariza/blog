/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#09090f",
          raised: "#101017",
          hover: "#17171f",
        },
        line: {
          DEFAULT: "#2a2a33",
          muted: "#1c1c24",
        },
        accent: "#38bdf8",
      },
      fontFamily: {
        sans: [
          "var(--font-allo)",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        hand: ["var(--font-hand)", "cursive"],
      },
      backgroundImage: {
        dots: "radial-gradient(rgb(255 255 255 / 0.07) 1px, transparent 1px)",
      },
      backgroundSize: {
        dots: "22px 22px",
      },
      borderRadius: {
        /** Elevated panels and interactive row hovers */
        surface: "0.375rem",
        /** Project cards and browser frames */
        card: "0.875rem",
      },
      boxShadow: {
        elevated:
          "0 10px 15px -3px rgb(0 0 0 / 0.35), 0 4px 6px -4px rgb(0 0 0 / 0.35)",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            code: {
              fontWeight: "400",
              backgroundColor: theme("colors.surface.hover"),
              borderRadius: theme("borderRadius.DEFAULT"),
              padding: "0.1em 0.3em",
            },
          },
        },
        invert: {
          css: {
            a: {
              color: theme("colors.neutral.300"),
              textDecoration: "underline",
              textDecorationColor: theme("colors.neutral.600"),
              textUnderlineOffset: "0.25rem",
              fontWeight: "400",
              transitionProperty: "color, text-decoration-color",
              transitionDuration: theme("transitionDuration.150"),
              transitionTimingFunction: theme("transitionTimingFunction.DEFAULT"),
              "&:hover": {
                color: theme("colors.neutral.200"),
              },
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
