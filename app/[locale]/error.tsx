/**
 * Error boundary for every page inside a locale. Client component
 * (required for error boundaries); `retry` re-renders the failed segment.
 * Labels are in French (the default locale) because the boundary does
 * not receive route params.
 */
"use client";

import { useEffect } from "react";
import fr from "@/lib/i18n/messages/fr";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Server errors only carry a digest here — log it for correlation
    // with the server-side logs.
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-5xl text-primary">!</p>
      <h1 className="mt-4 font-display text-3xl text-ink">{fr.error.title}</h1>
      <p className="mt-3 max-w-md text-muted">{fr.error.description}</p>
      <Button onClick={() => retry()} className="mt-8">
        {fr.error.retry}
      </Button>
    </Container>
  );
}