export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    "bg-white/5", "bg-white/8", "bg-white/10", "bg-white/12",
    "bg-white/15", "bg-white/18", "bg-white/20", "bg-white/25",
    "hover:bg-white/8", "hover:bg-white/10", "hover:bg-white/15",
    "hover:bg-white/18", "hover:bg-white/20", "hover:bg-white/25",
    "border-white/8", "border-white/10", "border-white/15",
    "border-white/20", "border-white/25",
    "bg-amethyst/15", "bg-pink-500/10", "bg-pink-500/30",
    "bg-rosewood/20", "bg-pink-600/10",
    "border-pink-500/30", "border-pink-500/10",
    "shadow-pink-900/40",
    "to-amethyst", "via-pink-700",
    "bg-white/8 p-1",
  ],
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
      },
      backgroundOpacity: {
        8: "0.08",
        12: "0.12",
        15: "0.15",
        18: "0.18",
      }
    }
  },
  plugins: []
};
