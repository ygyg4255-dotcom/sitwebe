/**
 * Loading fallback for every page inside a locale — a lightweight,
 * locale-independent skeleton shown while a segment streams in.
 */
export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl animate-pulse px-4 py-16 sm:px-6 lg:px-8"
      aria-busy="true"
    >
      <div className="mx-auto h-8 w-64 max-w-full rounded-full bg-sand" />
      <div className="mx-auto mt-4 h-4 w-96 max-w-full rounded-full bg-sand/70" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-brand-border bg-surface"
          >
            <div className="aspect-[16/10] w-full bg-sand" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 rounded-full bg-sand" />
              <div className="h-3 w-full rounded-full bg-sand/70" />
              <div className="h-3 w-2/3 rounded-full bg-sand/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}