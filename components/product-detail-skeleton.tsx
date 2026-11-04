export default function ProductDetailSkeleton() {
  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8" aria-label="Loading product details" aria-busy="true">
      <div className="mb-6 h-4 w-56 animate-pulse rounded bg-slate-100" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="aspect-square animate-pulse rounded-xl bg-slate-100" />
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-14 w-14 animate-pulse rounded-lg bg-slate-100" />)}
          </div>
        </div>
        <div className="space-y-5 py-2">
          <div className="h-4 w-28 animate-pulse rounded bg-green-50" />
          <div className="h-10 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-40 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="mt-8 h-14 w-36 animate-pulse rounded-lg bg-green-50" />
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="h-14 animate-pulse rounded-lg bg-green-100" />
            <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>
    </main>
  )
}
