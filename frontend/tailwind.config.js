export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        rosewood: "#be185d",
        amethyst: "#7c3aed",
        saffron: "#f59e0b"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
        "spin-slow": "spin 6s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite"
      }
    }
  },
  plugins: []
};
