export default function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="aspect-[4/3] rounded-xl bg-slate-100" />
      <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
      <div className="mt-4 h-4 w-1/2 rounded bg-slate-100" />
    </div>
  );
}

