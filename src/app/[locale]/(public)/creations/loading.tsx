export default function CreationsLoading() {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="container mx-auto max-w-7xl px-4 pb-20 pt-8">
        <div className="mb-12 max-w-3xl px-2">
          <div className="mb-4 h-5 w-48 animate-pulse rounded-full bg-muted" />
          <div className="mb-4 h-16 w-full max-w-2xl animate-pulse rounded-2xl bg-muted" />
          <div className="h-6 w-full max-w-xl animate-pulse rounded-full bg-muted" />
        </div>

        <div className="mb-10 flex flex-col gap-5 border-b border-border/60 px-2 pb-8 md:flex-row md:items-center md:justify-between">
          <div className="h-14 w-full animate-pulse rounded-2xl bg-muted md:max-w-xl" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-11 w-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 px-2 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm"
            >
              <div className="aspect-[4/5] animate-pulse bg-muted" />
              <div className="space-y-4 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
