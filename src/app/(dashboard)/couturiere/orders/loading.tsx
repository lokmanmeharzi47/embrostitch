export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-muted rounded-xl w-1/3" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}
