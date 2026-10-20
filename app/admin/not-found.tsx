/**
 * Admin 404 (French) — e.g. an unknown entity id passed to /admin/…/[id].
 */
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-border bg-surface p-8 text-center">
        <h1 className="font-display text-2xl text-ink">Page introuvable</h1>
        <p className="mt-2 text-sm text-muted">
          Cet élément n&apos;existe peut-être plus.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}