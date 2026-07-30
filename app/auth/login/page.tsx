"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import {
  LOGIN_MUTATION,
  GOOGLE_LOGIN_MUTATION,
  AUTO_LOGIN_MUTATION,
} from "@/app/graphql/mutation/auth.mutations";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

interface AutoLoginResponse {
  autoLogin: {
    token: string;
    refreshToken?: string;
    rememberToken?: string;
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
      avatar?: string;
    };
  };
}

interface GoogleLoginResponse {
  googleLogin: {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
      avatar?: string;
    };
  };
}

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkRememberToken = async () => {
      const rememberToken = localStorage.getItem("remember_token");
      if (rememberToken) {
        try {
          const result = await fetchGraphQL<AutoLoginResponse>(
            AUTO_LOGIN_MUTATION,
            { rememberToken },
          );
          if (result.data?.autoLogin) {
            const {
              token,
              user,
              refreshToken,
              rememberToken: newRememberToken,
            } = result.data.autoLogin;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            try {
              document.cookie = `token=${token}; Path=/; Max-Age=2592000; SameSite=Lax`;
              window.dispatchEvent(new Event("user-updated"));
            } catch {
              // Cookie setting failed
            }
            if (refreshToken) {
              localStorage.setItem("refreshToken", refreshToken);
            }
            if (newRememberToken) {
              localStorage.setItem("remember_token", newRememberToken);
            }
            toast.success(t("Welcome back!"));
            router.push("/");
          } else {
            localStorage.removeItem("remember_token");
          }
        } catch {
          console.error("Auto login failed");
          localStorage.removeItem("remember_token");
        }
      }
    };
    checkRememberToken();
  }, [router, t]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");
  const isEmailValid = emailValue && !errors.email;
  const isPasswordValid = passwordValue && !errors.password;

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchGraphQL<{ login: string }>(LOGIN_MUTATION, {
        input: {
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        },
      });

      if (result.data?.login) {
        const token = result.data.login;
        localStorage.setItem("token", token);
        localStorage.setItem("pending_email", data.email);
        if (data.rememberMe) {
          localStorage.setItem("remember_me", "true");
        } else {
          localStorage.removeItem("remember_me");
        }

        toast.success(t("OTP sent to your email!"));
        router.push("/auth/verify-otp");
      } else if (result.errors) {
        const errorMsg = result.errors[0].message;
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      console.error("Error during login");
      toast.error(t("Login failed. Please check your connection."));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);

      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );
        const userInfo = await userInfoResponse.json();

        const fullUsername = userInfo.email.split("@")[0];
        const username = fullUsername.slice(0, 30);

        const result = await fetchGraphQL<GoogleLoginResponse>(
          GOOGLE_LOGIN_MUTATION,
          {
            input: {
              email: userInfo.email,
              username: username,
              googleId: userInfo.sub,
            },
          },
        );

        if (result.data?.googleLogin) {
          const { token, user } = result.data.googleLogin;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("pending_email", userInfo.email);

          toast.success(t("OTP sent to your email!"));
          router.push("/auth/verify-otp");
        } else if (result.errors) {
          toast.error(result.errors[0].message);
          setIsGoogleLoading(false);
        }
      } catch {
        console.error("Error during Google login");
        toast.error(t("Failed to login with Google."));
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      console.error("Google login error");
      setIsGoogleLoading(false);
      toast.error(t("Google Sign-In failed. Please try again."));
    },
    flow: "implicit",
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="relative min-h-screen py-30 flex items-center justify-center px-4">
      <Image src="/b3.jpg" alt="bg" fill className="object-cover" />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-md px-6 sm:px-8 md:px-10 py-8 sm:py-10 rounded-xl sm:rounded-2xl bg-[#0a1a3a]/40 backdrop-blur-2xl border border-white/10 shadow-2xl my-10 sm:my-16 md:my-20">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 italic mb-6 sm:mb-8">
          {t("Login")}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-5 sm:mb-6">
            <label className="text-gray-200 font-semibold text-sm block mb-1">
              {t("Email")}
            </label>
            <div
              className={`flex items-center bg-white/30 rounded-xl px-3 sm:px-4 transition-all duration-200 ${
                errors.email && touchedFields.email
                  ? "border-2 border-red-500 ring-2 ring-red-500/20"
                  : isEmailValid && touchedFields.email
                  ? "border-2 border-green-500"
                  : "border border-transparent"
              }`}
            >
              <Mail size={18} className="text-blue-900 mr-2 sm:mr-3" />
              <input
                type="text"
                inputMode="email"
                placeholder={t("Enter your email address")}
                className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base placeholder:text-gray-400"
                {...register("email")}
              />
              {isEmailValid && touchedFields.email && (
                <CheckCircle size={18} className="text-green-500 ml-2" />
              )}
            </div>
            {errors.email && touchedFields.email && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-3">
            <label className="text-gray-200 font-semibold text-sm block mb-1">
              {t("Password")}
            </label>
            <div
              className={`flex items-center bg-white/30 rounded-xl px-3 sm:px-4 transition-all duration-200 ${
                errors.password && touchedFields.password
                  ? "border-2 border-red-500 ring-2 ring-red-500/20"
                  : isPasswordValid && touchedFields.password
                  ? "border-2 border-green-500"
                  : "border border-transparent"
              }`}
            >
              <Lock size={18} className="text-blue-900 mr-2 sm:mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("Enter your password")}
                className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base placeholder:text-gray-400"
                {...register("password")}
                onFocus={() => setShowPassword(true)}
                onBlur={() => setShowPassword(false)}
              />
              {passwordValue && passwordValue.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors ml-2 focus:outline-none"
                  aria-label={
                    showPassword ? t("Hide password") : t("Show password")
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-blue-900" />
                  ) : (
                    <Eye size={18} className="text-blue-900" />
                  )}
                </button>
              )}
            </div>
            {errors.password && touchedFields.password && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm mb-5 sm:mb-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-yellow-400 transition">
              <input
                type="checkbox"
                className="accent-yellow-400 w-4 h-4 rounded"
                {...register("rememberMe")}
              />
              {t("Remember Me")}
            </label>
            <Link
              href="/auth/forgot-password"
              className="cursor-pointer text-gray-200 hover:text-yellow-400 transition-colors underline-offset-4 hover:underline"
            >
              {t("Forgot Password?")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || !isValid}
            className={`w-full py-2.5 sm:py-3 bg-[#0b2a6b] text-white rounded-xl border-l-4 border-r-4 border-yellow-400 font-semibold transition-all duration-200 shadow-lg ${
              loading || !isValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-90 hover:shadow-yellow-400/20"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("Logging in...")}
              </span>
            ) : (
              t("Login")
            )}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="mt-4 w-full py-2.5 sm:py-3 rounded-xl border border-white/20 text-white flex items-center justify-center gap-3 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Image
            src="/icons8-google-48.png"
            alt="Google Icon"
            width={20}
            height={20}
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain group-hover:scale-105 transition"
          />
          {isGoogleLoading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t("Processing...")}
            </span>
          ) : (
            t("Log In With Google")
          )}
        </button>

        <p className="text-center text-xs sm:text-sm mt-6 text-gray-300">
          {t("Don't have an account?")}{" "}
          <Link
            href="/auth/register"
            className="text-yellow-400 font-semibold hover:underline transition hover:text-yellow-300"
          >
            {t("Sign Up")}
          </Link>
        </p>
      </div>
    </div>
  );
}
