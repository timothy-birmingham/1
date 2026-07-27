/**
 * Central runtime configuration. Keeping these reads in one module means
 * that switching databases, hosting the app under a SharePoint subpath, or
 * swapping in real Entra ID auth later only touches this file plus the
 * relevant env vars -- not call sites scattered across the app.
 */

export type AuthProvider = "simulated" | "entra-id";

export const config = {
  /** Base path the app is served from, e.g. "/it-equipment" when embedded
   * under a SharePoint subpath. next.config.ts reads the same value from
   * APP_BASE_PATH (no NEXT_PUBLIC_ prefix) to set Next's `basePath` option;
   * it's duplicated here under the NEXT_PUBLIC_ prefix so client components
   * can read it too -- Next only inlines env vars into the client bundle
   * when they carry that prefix. Keep both in sync when deploying. */
  basePath: process.env.NEXT_PUBLIC_APP_BASE_PATH || "",

  /** Which identity provider supplies the current user. "simulated" uses the
   * cookie-based role switcher in lib/auth; "entra-id" is reserved for a
   * future NextAuth + Azure AD provider that implements the same
   * getCurrentUser() contract. */
  authProvider: (process.env.AUTH_PROVIDER as AuthProvider) || "simulated",

  /** Comma-separated list of origins allowed to iframe-embed this app (e.g.
   * your tenant's SharePoint domain). Used to build the CSP frame-ancestors
   * directive in next.config.ts. Empty by default (no embedding allowed)
   * until explicitly configured for deployment. */
  allowedFrameAncestors: (process.env.ALLOWED_FRAME_ANCESTORS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
