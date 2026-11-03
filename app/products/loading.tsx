export default function Loading() {
  return (
    <div className="min-h-screen bg-white" aria-label="Loading products" aria-busy="true">
      <div className="h-16 border-b border-green-100 bg-white sm:h-20" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 h-12 animate-pulse rounded-lg bg-green-50" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-slate-100 bg-white">
              <div className="aspect-square animate-pulse bg-slate-100" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-2/5 animate-pulse rounded bg-slate-100" />
                <div className="h-9 animate-pulse rounded bg-green-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
