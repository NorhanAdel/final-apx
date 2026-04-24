"use client";

import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GOOGLE_REGISTER_MUTATION } from "@/app/graphql/mutation/auth.mutations";
import { RoleType } from "../components/auth/RoleSelectionModal";

interface GoogleUserData {
  email: string;
  username: string;
  googleId: string;
}

interface UseGoogleRegisterReturn {
  // States
  isLoading: boolean;
  showRoleModal: boolean;
  googleUserData: GoogleUserData | null;

  // Actions
  initiateGoogleLogin: () => void;
  submitWithRole: (role: RoleType) => Promise<void>;
  closeModal: () => void;
}

export function useGoogleRegister(): UseGoogleRegisterReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<GoogleUserData | null>(
    null,
  );

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);

      try {
        // Fetch user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );
        const userInfo = await userInfoResponse.json();

        // Generate username from email
        const fullUsername = userInfo.email.split("@")[0];
        const username = fullUsername.slice(0, 30);

        // Store Google data and show role modal
        setGoogleUserData({
          email: userInfo.email,
          username: username,
          googleId: userInfo.sub,
        });

        setIsLoading(false);
        setShowRoleModal(true);
      } catch (error) {
        console.error("Error fetching Google user info:", error);
        toast.error(
          "Failed to fetch Google account information. Please try again.",
        );
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      setIsLoading(false);
      toast.error("Failed to sign in with Google. Please try again.");
    },
    flow: "implicit",
  });

  const submitWithRole = async (role: RoleType) => {
    if (!googleUserData) return;

    try {
      const result = await fetchGraphQL<{ googleRegister: string }>(
        GOOGLE_REGISTER_MUTATION,
        {
          input: {
            email: googleUserData.email,
            username: googleUserData.username,
            googleId: googleUserData.googleId,
            role: role,
          },
        },
      );

      if (result.data?.googleRegister) {
        localStorage.setItem("pending_email", googleUserData.email);
        toast.success(
          "Google registration successful! Check your email for the OTP.",
        );
        setShowRoleModal(false);
        router.push("/auth/verify-otp");
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to register with Google. Please try again.");
      throw error;
    }
  };

  const closeModal = () => {
    setShowRoleModal(false);
    setGoogleUserData(null);
  };

  return {
    isLoading,
    showRoleModal,
    googleUserData,
    initiateGoogleLogin: googleLogin,
    submitWithRole,
    closeModal,
  };
}
