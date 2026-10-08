/**
 * Decorative photo placeholder (Phase 1 only).
 *
 * Until real photography is stored in Supabase Storage (Phase 2+), tour and
 * destination visuals are rendered as gradient scenes with a dune motif.
 * Each `variant` is one of the palette moods of the Terracotta/Sahara
 * identity. Replaced by next/image once Storage is wired up.
 */

export type PhotoVariant = "terracotta" | "teal" | "gold" | "dune";

const variantOrder: PhotoVariant[] = ["terracotta", "dune", "teal", "gold"];

/**
 * Deterministically picks a decorative variant from a key (usually the
 * record slug), so the same tour/destination always shows the same scene.
 */
export function photoVariantFor(seed: string): PhotoVariant {
  let sum = 0;
  for (const ch of seed) sum += ch.charCodeAt(0);
  return variantOrder[sum % variantOrder.length];
}

const gradients: Record<PhotoVariant, string> = {
  terracotta: "linear-gradient(135deg, #e2a06b 0%, #c0532e 55%, #8f3a1a 100%)",
  teal: "linear-gradient(135deg, #7fb8b3 0%, #2e6e6a 55%, #1d4b48 100%)",
  gold: "linear-gradient(135deg, #ecc56f 0%, #d9a441 55%, #b57f22 100%)",
  dune: "linear-gradient(135deg, #f0d9b8 0%, #d8a75f 55%, #a96f35 100%)",
};

interface PhotoPlaceholderProps {
  variant: PhotoVariant;
  /** Optional label chip (e.g. destination name) shown bottom-start. */
  label?: string;
  /** Tailwind classes for size/shape, e.g. "aspect-[16/10] w-full". */
  className?: string;
}

export function PhotoPlaceholder({
  variant,
  label,
  className,
}: PhotoPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ background: gradients[variant] }}
    >
      {/* Dune scene motif: sun + layered dune silhouettes. */}
      <svg
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <circle cx="308" cy="72" r="34" fill="#ffffff" opacity="0.85" />
        <path
          d="M0 196 Q 90 148 180 192 T 400 172 V 260 H 0 Z"
          fill="#000000"
          opacity="0.14"
        />
        <path
          d="M0 226 Q 120 184 240 222 T 400 202 V 260 H 0 Z"
          fill="#000000"
          opacity="0.26"
        />
      </svg>
      {label ? (
        <span className="absolute bottom-3 start-3 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {label}
        </span>
      ) : null}
    </div>
  );
}