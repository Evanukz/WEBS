export default function Button({ className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    />
  );
}

