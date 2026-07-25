"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RESET_PASSWORD_MUTATION } from "@/app/graphql/mutation/auth.mutations";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const { t } = useTranslate();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPasswordSchema = useMemo(() => {
    return z
      .object({
        newPassword: z
          .string()
          .min(8, t("Password must be at least 8 characters"))
          .regex(/[a-z]/, t("Password must contain at least one lowercase letter"))
          .regex(/[A-Z]/, t("Password must contain at least one uppercase letter"))
          .regex(/[0-9]/, t("Password must contain at least one number"))
          .regex(/[^a-zA-Z0-9]/, t("Password must contain at least one special character")),
        confirmPassword: z.string().min(1, t("Please confirm your password")),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: t("Passwords do not match"),
        path: ["confirmPassword"],
      });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: any) => {
    if (!token || !email) {
      toast.error(t("Invalid reset link. Please request a new one."));
      router.push("/auth/forgot-password");
      return;
    }

    setLoading(true);

    try {
      const result = await fetchGraphQL<{ resetPassword: string }>(
        RESET_PASSWORD_MUTATION,
        {
          input: {
            email,
            token,
            newPassword: data.newPassword,
          },
        }
      );

      if (result.data) {
        toast.success(t("Password Reset Successfully!"));
        setTimeout(() => router.push("/auth/login"), 2000);
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch {
      toast.error(t("Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Password validation checks
  const hasMinLength = newPassword?.length >= 8;
  const hasLowercase = /[a-z]/.test(newPassword || "");
  const hasUppercase = /[A-Z]/.test(newPassword || "");
  const hasNumber = /[0-9]/.test(newPassword || "");
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword || "");

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/b3.jpg')" }}
      />

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

      <div className="relative w-full max-w-md px-6 py-10 rounded-2xl bg-[#0a1a3a]/40 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <h1 className="text-4xl font-black italic text-center text-yellow-500 mb-10 uppercase">
          {t("Reset Password")}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* NEW PASSWORD */}
          <div>
            <label className="text-white text-sm font-bold block mb-2">
              {t("New Password")}
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />

              <input
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                className={`w-full bg-[#2d3055]/60 border rounded-xl py-4 px-12 text-white focus:outline-none transition ${
                  errors.newPassword && touchedFields.newPassword
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : newPassword && newPassword.length > 0 && !errors.newPassword
                    ? "border-green-500"
                    : "border-white/10 focus:border-yellow-400"
                }`}
                placeholder={t("Enter your new password")}
              />
            </div>

            {/* Password Requirements - like Register */}
            {newPassword && newPassword.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2">
                  {hasMinLength ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                  <span className={hasMinLength ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                    {t("At least 8 characters")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasLowercase && hasUppercase ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                  <span className={hasLowercase && hasUppercase ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                    {t("Uppercase & lowercase letters")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                  <span className={hasNumber ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                    {t("At least one number")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSpecial ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                  <span className={hasSpecial ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                    {t("At least one special character")}
                  </span>
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.newPassword.message as string}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-white text-sm font-bold block mb-2">
              {t("Confirm Password")}
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`w-full bg-[#2d3055]/60 border rounded-xl py-4 px-12 text-white focus:outline-none transition ${
                  errors.confirmPassword && touchedFields.confirmPassword
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-white/10 focus:border-yellow-400"
                }`}
                placeholder={t("Confirm your new password")}
              />
            </div>

            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.confirmPassword.message as string}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            disabled={loading || !isValid}
            className={`w-full py-4 bg-[#051139] border-2 border-yellow-500 text-white font-bold uppercase rounded-lg transition-all duration-300 ${
              loading || !isValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-yellow-500 hover:text-black"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("Resetting...")}
              </span>
            ) : (
              t("Reset Password")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}