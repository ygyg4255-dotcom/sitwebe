/**
 * Centers page content with a consistent horizontal gutter.
 * Every section uses this — never set max-width by hand.
 */
import type { ComponentPropsWithoutRef } from "react";

export function Container({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className ?? ""}`}
      {...props}
    />
  );
}