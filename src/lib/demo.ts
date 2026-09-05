/**
 * TEMPORARY DEMO MODE — Firebase bypass.
 *
 * When true, the app runs as a pure frontend prototype:
 * no Firebase Auth is initialised/observed, no Firestore reads or writes
 * happen, login/signup navigate straight to the dashboard, and pages fall
 * back to empty states (results pages still use the built-in mock analysis).
 *
 * To restore the real Firebase flow, set this to false. Nothing else changes.
 */
// Typed as boolean (not a literal) so TypeScript keeps both branches live.
export const DEMO_MODE: boolean = true;
