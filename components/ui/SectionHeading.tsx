/**
 * Consistent section heading across the site:
 * small terracotta eyebrow → display-font title → muted subtitle.
 */
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Defaults to "center". "start" is used in RTL-aware layouts. */
  align?: "center" | "start";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={[
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className ?? "",
      ].join(" ")}
    >
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 text-muted">{subtitle}</p> : null}
    </div>
  );
}