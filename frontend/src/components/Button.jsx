export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-rosewood text-white hover:bg-pink-800",
    secondary: "bg-white text-rosewood border border-pink-200 hover:bg-pink-50",
    dark: "bg-neutral-900 text-white hover:bg-neutral-800",
    soft: "bg-pink-100 text-pink-900 hover:bg-pink-200"
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
