export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl flex h-full flex-col overflow-hidden bg-surface shadow-md">
      <div className="aspect-square animate-shimmer" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-3 w-16 animate-shimmer rounded" />
        <div className="h-4 w-full animate-shimmer rounded" />
        <div className="h-4 w-2/3 animate-shimmer rounded" />
        <div className="mt-auto h-5 w-20 animate-shimmer rounded" />
        <div className="mt-1 h-10 w-full animate-shimmer rounded-full" />
      </div>
    </div>
  );
}
