"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { loginWithGoogle } from "@/services/authService";
import { removeToken } from "@/utils/helpers";

export default function GoogleSignInButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);

    // Clear any stale token before login attempt
    removeToken();

    try {
      const result = await loginWithGoogle(credentialResponse.credential);

      console.log("Google login result:", result); // Debug log

      if (result.status === "AUTHENTICATED") {
        toast.success("Welcome back! Signing you in…");
        // Use replace instead of push (prevents back-button issue)
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 400);
      } else if (result.status === "PROFILE_INCOMPLETE") {
        toast.info("Almost there! Let's set up your profile.");

        // Store Google data for the complete-profile page
        sessionStorage.setItem(
          "googleSignupData",
          JSON.stringify({
            credential: credentialResponse.credential,
            email: result.email,
            name: result.name,
            picture: result.picture,
          })
        );

        setTimeout(() => {
          window.location.href = "/complete-profile";
        }, 400);
      } else {
        toast.error("Unexpected response from server. Please try again.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      toast.error(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    toast.error("Google sign-in was cancelled or failed.");
  };

  if (loading) {
    return (
      <div className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm font-semibold text-gray-600">
          Signing in with Google…
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-center [&>div]:!w-full [&_iframe]:!w-full [&>div>div]:!w-full">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="outline"
          size="large"
          shape="rectangular"
          text="continue_with"
          width="360"
          logo_alignment="center"
        />
      </div>
    </div>
  );
}