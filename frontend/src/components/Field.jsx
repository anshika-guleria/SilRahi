export function Field({ label, children }) {
  return (

    <label className="block">
      {/* 📐 Spacing and Alignment: Ensuring crisp, readable labels across screen sizes */}
      <span className="mb-1.5 block text-sm font-semibold text-neutral-700 tracking-wide">
        {label}
      </span>

    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</span>

      {children}
    </label>
  );
}

/* 🎨 Upgraded input styling for mobile layouts, typography, and touch target rules */
export const inputClass =

  "w-full rounded-lg border border-pink-100 bg-white px-4 py-3 text-base md:text-sm text-neutral-900 shadow-sm transition-colors duration-150 focus:outline-none focus:border-rosewood focus:ring-2 focus:ring-pink-200/60";

  "w-full min-w-0 rounded-lg border border-pink-100 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-rosewood focus:ring-2 focus:ring-pink-100";
