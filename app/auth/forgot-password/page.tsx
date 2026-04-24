"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FORGOT_PASSWORD_MUTATION } from "@/app/graphql/mutation/auth.mutations";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

type ForgotPasswordFormData = z.infer<
  z.ZodObject<{
    email: z.ZodString;
  }>
>;

export default function ForgotPassword() {
  const { t } = useTranslate();
  const [loading, setLoading] = useState(false);

  const forgotPasswordSchema = useMemo(() => {
    return z.object({
      email: z.string().email(t("Invalid email address")),
    });
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);

    try {
      const result = await fetchGraphQL<{ forgotPassword: string }>(
        FORGOT_PASSWORD_MUTATION,
        { input: { email: data.email } },
      );

      if (result.data) {
        toast.success(t("Check your email!"), {
          description: t(
            "If this email is registered, you will receive a reset link.",
          ),
          duration: 6000,
        });
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
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <Image src="/b3.jpg" alt="bg" fill className="object-cover" />
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-md px-6 sm:px-8 md:px-10 py-8 sm:py-10 rounded-xl sm:rounded-2xl bg-[#0a1a3a]/40 backdrop-blur-2xl border border-white/10 shadow-2xl my-10 sm:my-16 md:my-20">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-yellow-400 text-xs sm:text-sm mb-6 transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          {t("Back to Login")}
        </Link>

        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 italic mb-4 sm:mb-6 tracking-tight">
          {t("Forgot Password")}
        </h2>

        <p className="text-center text-xs sm:text-sm mb-8 italic leading-relaxed text-gray-300">
          {t(
            "Enter your email address and we'll send you a link to reset your password.",
          )}
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label className="text-gray-200 font-semibold text-sm">
              {t("Email Address")}
            </label>
            <div className="flex items-center mt-2 bg-white/30 rounded-xl px-3 sm:px-4 border border-white/10 focus-within:border-yellow-400/50 transition-all">
              <Mail size={18} className="text-blue-900 mr-2 sm:mr-3" />
              <input
                type="email"
                placeholder={t("Enter your email")}
                className="w-full py-2.5 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base placeholder:text-white/40"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-[#0b2a6b] text-white rounded-xl border-l-4 border-r-4 border-yellow-400 font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg uppercase text-sm tracking-wider"
          >
            {loading ? t("Sending link...") : t("Send Reset Link")}
          </button>
        </form>

        <p className="text-center text-[10px] sm:text-xs mt-8 italic text-gray-300">
          {t("Didn't receive an email? Check your spam folder.")}
        </p>
      </div>
    </div>
  );
}
