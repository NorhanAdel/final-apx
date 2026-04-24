"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
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
        newPassword: z.string().min(6, t("Password must be at least 6 characters")),
        confirmPassword: z.string().min(6, t("Password must be at least 6 characters")),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: t("Passwords do not match"),
        path: ["confirmPassword"],
      });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

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
            <label className="text-white text-sm font-bold">{t("New Password")}</label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />

              <input
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                className="w-full bg-[#2d3055]/60 border border-white/10 rounded-xl py-4 px-12 text-white"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              >
                {showNewPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {errors.newPassword && (
              <p className="text-red-400 text-xs">{errors.newPassword.message as string}</p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-white text-sm font-bold">{t("Confirm Password")}</label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="w-full bg-[#2d3055]/60 border border-white/10 rounded-xl py-4 px-12 text-white"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-400 text-xs">
                {errors.confirmPassword.message as string}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full py-4 bg-[#051139] border border-yellow-500 text-white font-bold uppercase rounded-lg"
          >
            {loading ? t("Resetting...") : t("Reset Password")}
          </button>

        </form>
      </div>
    </div>
  );
}