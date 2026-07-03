export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-rosewood text-white hover:bg-pink-800",
    secondary: "bg-white text-rosewood border border-pink-200 hover:bg-pink-50",
    dark: "bg-neutral-900 text-white hover:bg-neutral-800",
    soft: "bg-pink-100 text-pink-900 hover:bg-pink-200"
  };

  return (
    <button

      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition 
        disabled:cursor-not-allowed disabled:opacity-60
        
        /* 👆 Touch Targets & Mobile Layout Improvements */
        px-5 py-3 text-base md:text-sm min-h-[44px] active:scale-[0.98]
        
        /* ♿ Keyboard Accessibility & Focus States */
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rosewood
        
        ${variants[variant]} ${className}
      `}

      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold leading-tight transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}

      {...props}
    >
      {children}
    </button>
  );
}