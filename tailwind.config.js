/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF5964",
        secondary: "#8B1E3F",
        accent: "#00A69B",
        gray_100: "#212529",
        gray_75: "#343A40",
        gray_50: "#868e96",
        gray_25: "#CED4DA",
        gray_0: "#F8F9FA",
      },
      fontFamily: {
        hepta_bold: "HeptaSlab_900",
        hepta_semibold: "HeptaSlab_700",
        hepta_medium: "HeptaSlab_600",
        hepta_regular: "HeptaSlab_500",
        hepta_light: "HeptaSlab_400",
      },
      fontSize: {
        h1: "50px",
        h2: "38px",
        h3: "28px",
        h4: "21px",
        h5: "12px",
        p: "16px",
      },
      borderWidth: {
        input: "1.5px",
      },
    },
  },
  plugins: [],
};
