"use client";

/**
 * Admin error boundary (French). Errors in admin pages (database
 * failures, …) land here instead of crashing the whole back office.
 */
export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-primary/40 bg-surface p-8 text-center">
        <h1 className="font-display text-2xl text-ink">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted">
          L&apos;opération a échoué. Réessayez — si le problème persiste,
          vérifiez la connexion à la base de données.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}