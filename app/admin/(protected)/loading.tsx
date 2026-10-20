/** Route-level loading state for the admin area (French). */
export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
      <p className="text-sm text-muted">Chargement…</p>
    </div>
  );
}