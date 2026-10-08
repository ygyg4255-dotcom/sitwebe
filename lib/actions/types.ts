/**
 * Shared return type for every Server Action. Components render a
 * simple success/error message from it (Phase 4 forms).
 */
export type ActionResult =
  | { success: true }
  | { success: false; error: string };