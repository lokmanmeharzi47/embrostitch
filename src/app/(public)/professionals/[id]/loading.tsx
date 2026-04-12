export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-12 pb-20 animate-pulse w-full">
      <div className="h-32 bg-muted rounded-2xl mb-6" />
      <div className="h-8 bg-muted rounded w-1/3 mb-4" />
      <div className="h-4 bg-muted rounded w-2/3 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-32 bg-muted rounded-2xl" />
    </div>
  );
}
