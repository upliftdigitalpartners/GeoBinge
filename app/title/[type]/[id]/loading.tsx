export default function Loading() {
  return (
    <div className="relative">
      <div className="skeleton h-[55vh] min-h-[380px] w-full" />
      <div className="mx-auto -mt-56 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <div className="skeleton mx-auto aspect-[2/3] w-48 rounded-2xl md:mx-0 md:w-full" />
          <div className="space-y-4">
            <div className="skeleton h-12 w-3/4 rounded-lg" />
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-4/6 rounded" />
          </div>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
