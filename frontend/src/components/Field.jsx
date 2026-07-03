export function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full min-w-0 rounded-lg border border-pink-100 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm focus:border-rosewood focus:ring-2 focus:ring-pink-100";
