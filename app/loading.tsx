export default function Loading() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
      <div className="h-7 w-48 animate-pulse rounded bg-neutral-700/50" />
      <div className="h-4 w-full max-w-md animate-pulse rounded bg-neutral-700/40" />
      <div className="h-4 w-3/4 max-w-sm animate-pulse rounded bg-neutral-700/40" />
    </div>
  );
}
