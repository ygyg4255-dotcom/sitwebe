/**
 * Renders a JSON-LD structured-data object as a <script> tag.
 *
 * The data is built server-side from typed database rows (see
 * lib/seo.ts). `JSON.stringify` output has every "<" escaped to
 * "<", so database content can never terminate the script tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}