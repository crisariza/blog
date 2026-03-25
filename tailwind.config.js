/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#1c1c1c",
          raised: "#171717",
          hover: "#262626",
        },
        line: {
          DEFAULT: "#404040",
          muted: "#262626",
        },
      },
      borderRadius: {
        /** Elevated panels and interactive row hovers */
        surface: "0.375rem",
      },
      boxShadow: {
        elevated:
          "0 10px 15px -3px rgb(0 0 0 / 0.35), 0 4px 6px -4px rgb(0 0 0 / 0.35)",
      },
      typography: (theme) => ({
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
