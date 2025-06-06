/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#5A983B",
        secondary: "#515151",
      },
      fontFamily: {
        Inter: ["Inter_400Regular", "sans-serif"],
        InterBold: ["Inter_700Bold", "sans-serif"],
        InterExtraBold: ["Inter_800ExtraBold", "sans-serif"],
        InterExtraLight: ["Inter_200ExtraLight", "sans-serif"],
        InterLight: ["Inter_300Light", "sans-serif"],
        InterMedium: ["Inter_500Medium", "sans-serif"],
        InterSemiBold: ["Inter_600SemiBold", "sans-serif"],
      },
    },
  },
  plugins: [],
};
