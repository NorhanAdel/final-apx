"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { REGISTER_MUTATION } from "@/app/graphql/mutation/auth.mutations";
import useTranslate from "@/app/hooks/useTranslate";
import { useGoogleRegister } from "@/app/hooks/useGoogleRegister";
import RegisterForm from "@/app/components/auth/RegisterForm";
import GoogleRegisterButton from "@/app/components/auth/GoogleRegisterButton";
import RoleSelectionModal from "@/app/components/auth/RoleSelectionModal";

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  role: "PLAYER" | "SCOUT" | "AGENT" | "CLUB" | "USER";
};

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    isLoading: isGoogleLoading,
    showRoleModal,
    googleUserData,
    initiateGoogleLogin,
    submitWithRole,
    closeModal,
  } = useGoogleRegister();

  const registerSchema = useMemo(() => {
    return z.object({
      username: z
        .string()
        .min(1, t("Username is required"))
        .min(3, t("Username must be at least 3 characters"))
        .max(30, t("Username cannot exceed 30 characters"))
        .regex(
          /^[a-zA-Z0-9_]+$/,
          t("Username can only contain letters, numbers and underscore"),
        ),
      email: z
        .string()
        .min(1, t("Email is required"))
        .regex(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          t("Please enter a valid email address"),
        ),
      password: z
        .string()
        .min(1, t("Password is required"))
        .min(8, t("Password must be at least 8 characters"))
        .regex(/[a-z]/, t("Password must contain at least one lowercase letter"))
        .regex(/[A-Z]/, t("Password must contain at least one uppercase letter"))
        .regex(/[0-9]/, t("Password must contain at least one number"))
        .regex(
          /[^a-zA-Z0-9]/,
          t("Password must contain at least one special character"),
        ),
      role: z.enum(["PLAYER", "SCOUT", "AGENT", "CLUB", "USER"]),
    });
  }, [t]);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      role: "USER",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchGraphQL<{ register: { message: string } }>(
        REGISTER_MUTATION,
        { input: data },
      );

      if (result.data?.register) {
        localStorage.setItem("pending_email", data.email);
        toast.success(
          t("Registration successful! OTP has been sent to your email."),
        );
        router.push("/auth/verify-otp");
      } else if (result.errors) {
        const errorMsg = result.errors[0].message;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(t("Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen py-20 flex items-center justify-center px-4">
        <Image src="/b3.jpg" alt="bg" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative w-full max-w-md px-6 sm:px-8 md:px-10 py-8 sm:py-10 rounded-xl sm:rounded-2xl bg-[#090B6E]/30 backdrop-blur-2xl border border-white/10 shadow-2xl my-10 sm:my-16 md:my-20">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 italic mb-6 sm:mb-8">
            {t("Register")}
          </h2>

          <RegisterForm
            form={form}
            onSubmit={onSubmit}
            isLoading={loading}
            error={error}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#090B6E]/30 text-gray-400">OR</span>
            </div>
          </div>

          <GoogleRegisterButton
            onClick={initiateGoogleLogin}
            isLoading={isGoogleLoading}
          />

          <p className="text-center text-xs sm:text-sm mt-6 text-gray-300">
            {t("Already have an account?")}{" "}
            <Link
              href="/auth/login"
              className="text-yellow-400 font-semibold hover:underline transition hover:text-yellow-300"
            >
              {t("Login")}
            </Link>
          </p>
        </div>
      </div>

      {showRoleModal && googleUserData && (
        <RoleSelectionModal
          isOpen={showRoleModal}
          onClose={closeModal}
          onSubmit={submitWithRole}
          userEmail={googleUserData.email}
          username={googleUserData.username}
        />
      )}
    </>
  );
}