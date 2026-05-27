export function PageSkeleton({ message = "Loading…" }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-50 text-ink-900">
      <div className="card max-w-md p-6 text-center">
        <div className="font-display text-xl text-ink-900">1 Crore Property</div>
        <p className="mt-2 text-[13.5px] text-ink-500">{message}</p>
      </div>
    </div>
  );
}
