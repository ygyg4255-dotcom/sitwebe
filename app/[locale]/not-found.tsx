/**
 * 404 page for paths inside a locale (e.g. /fr/unknown-page).
 * Labels are in French (the default locale) because the not-found
 * boundary does not receive route params.
 */
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl text-primary">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Désolé, la page que vous cherchez n’existe pas ou a été déplacée.
      </p>
      <ButtonLink href="/fr" className="mt-8">
        Retour à l’accueil
      </ButtonLink>
    </Container>
  );
}