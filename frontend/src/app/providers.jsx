"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

/**
 * Client-side providers wrapper.
 * Keeps layout.js as a server component (needed for metadata export).
 */
export default function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn(
      "⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google Sign-In will be disabled."
    );
    return children;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}