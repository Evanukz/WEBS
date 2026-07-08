export default function Card({ className = '', ...props }) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 ${className}`} {...props} />
  );
}

