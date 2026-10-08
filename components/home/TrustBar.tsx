/**
 * Key figures strip under the hero (experience, travelers, rating).
 */
import type { Dictionary } from "@/lib/i18n/messages/fr";
import { Container } from "@/components/ui/Container";

interface TrustBarProps {
  items: Dictionary["home"]["trustBar"];
}

export function TrustBar({ items }: TrustBarProps) {
  return (
    <section className="border-b border-brand-border/70">
      <Container className="flex flex-col items-center justify-around gap-6 py-8 sm:flex-row">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="font-display text-3xl text-primary">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}