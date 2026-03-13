/**
 * Lightweight themed loading state for route transitions and auth check.
 * Keeps UI feeling responsive while data or chunks load.
 */
export function RouteLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--theme-bg-base)] text-[var(--theme-text)]"
      role="status"
      aria-label="Loading"
    >
      <div
        className="w-10 h-10 rounded-full border-2 border-[var(--theme-border)] border-t-[var(--theme-accent)] animate-spin"
        aria-hidden
      />
      <p className="text-sm font-medium text-[var(--theme-text-dim)]">Loading…</p>
    </div>
  );
}

export default RouteLoader;
