"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { loginWithGoogle } from "@/services/authService";
import { removeToken } from "@/utils/helpers";

/**
 * Custom Google Sign-In button.
 *
 * Uses Google Identity Services (GIS) directly via window.google.accounts.id,
 * which is loaded by @react-oauth/google's <GoogleOAuthProvider>.
 *
 * Why not <GoogleLogin />?
 *   - Google's rendered button is an iframe — CSS can't fully style it.
 *   - Height, font, padding all fixed by Google → clashes with our design system.
 *
 * This custom button gives us pixel-perfect control while still using
 * the official ID token flow that our backend expects.
 */
export default function GoogleSignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const handledRef = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // ── Handle ID token response from Google ──────────────────────────────────
  const handleCredentialResponse = async (response) => {
    // Prevent double-firing (Google sometimes calls twice)
    if (handledRef.current) return;
    handledRef.current = true;

    setLoading(true);
    removeToken(); // clear any stale token before login

    try {
      const result = await loginWithGoogle(response.credential);

      if (result.status === "AUTHENTICATED") {
        toast.success("Welcome back", {
          description: "Redirecting to your dashboard.",
        });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 400);
      } else if (result.status === "PROFILE_INCOMPLETE") {
        toast.info("Almost there", {
          description: "Let's finish setting up your profile.",
        });

        sessionStorage.setItem(
          "googleSignupData",
          JSON.stringify({
            credential: response.credential,
            email: result.email,
            name: result.name,
            picture: result.picture,
          })
        );

        setTimeout(() => {
          window.location.href = "/complete-profile";
        }, 400);
      } else {
        toast.error("Sign in failed", {
          description: "Unexpected response from server. Please try again.",
        });
        handledRef.current = false;
      }
    } catch (err) {
      toast.error("Google sign-in failed", {
        description: err.message || "Please try again.",
      });
      handledRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // ── Initialize Google Identity Services once on mount ─────────────────────
  useEffect(() => {
    if (!clientId) {
      console.warn("[GoogleSignInButton] NEXT_PUBLIC_GOOGLE_CLIENT_ID not set");
      return;
    }

    let interval;

    const initGIS = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          use_fedcm_for_prompt: false,
        });
        setGisReady(true);
        if (interval) clearInterval(interval);
      }
    };

    // GIS script is loaded by <GoogleOAuthProvider> in providers.jsx.
    // Poll until it's ready (usually <500ms).
    initGIS();
    if (!gisReady) {
      interval = setInterval(initGIS, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // ── Trigger Google sign-in flow on click ──────────────────────────────────
  const handleClick = () => {
    if (!gisReady || loading) return;
    handledRef.current = false;

    // Use One Tap prompt as the trigger — user picks account from popup
    window.google.accounts.id.prompt((notification) => {
      // If prompt is suppressed or skipped, fall back to popup flow
      if (
        notification.isNotDisplayed?.() ||
        notification.isSkippedMoment?.()
      ) {
        // Fallback: render a hidden button and click it programmatically
        openPopupFallback();
      }
    });
  };

  // ── Popup fallback (if One Tap is blocked by browser) ─────────────────────
  const openPopupFallback = () => {
    // Create a temporary hidden container and render Google's button into it,
    // then trigger a click. This uses Google's own popup flow.
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      click_listener: () => {}, // no-op
    });

    // Click the hidden Google button
    const googleBtn = container.querySelector('div[role="button"]');
    if (googleBtn) {
      googleBtn.click();
    }

    // Clean up after a delay
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }, 500);
  };

  // ── Render our custom button (pixel-perfect match with Contact Support) ──
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !gisReady}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
          <span>Signing in…</span>
        </>
      ) : (
        <>
          <GoogleGlyph />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}

/**
 * Official Google "G" logo (4-color).
 * Permitted use per Google Branding Guidelines when linking to Google Sign-In.
 * https://developers.google.com/identity/branding-guidelines
 */
function GoogleGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}