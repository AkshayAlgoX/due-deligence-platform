"use client";

import LandingPage from "@/components/landing/LandingPage";

/**
 * Root route — always renders the marketing landing page.
 *
 * Marketing routes (/ , /pricing, /docs, /privacy, /terms, /security,
 * /contact, /checkout) are deliberately NOT auth-gated: logged-in users
 * can browse them freely (e.g. clicking "Features" from /contact must
 * land here, not bounce to /dashboard). Authenticated users get a
 * "Dashboard" button in the landing nav instead.
 */
export default function RootPage() {
  return <LandingPage />;
}
