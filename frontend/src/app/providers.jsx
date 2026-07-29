"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import I18nProvider from "@/components/I18nProvider";

/**
 * Client-side providers wrapper.
 * Keeps layout.js as a server component (needed for metadata export).
 */
export default function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    children
  );

  return <I18nProvider>{content}</I18nProvider>;
}