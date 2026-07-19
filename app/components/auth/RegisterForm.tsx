"use client";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import useTranslate from "@/app/hooks/useTranslate";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  role: "PLAYER" | "SCOUT" | "AGENT" | "CLUB" | "USER";
}

interface RegisterFormProps {
  form: UseFormReturn<RegisterFormData>;
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function RegisterForm({
  form,
  onSubmit,
  isLoading = false,
  error = "",
}: RegisterFormProps) {
  const { t } = useTranslate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
  } = form;

  const usernameValue = watch("username");
  const emailValue = watch("email");
  const passwordValue = watch("password");
  const roleValue = watch("role");

  const isUsernameValid = usernameValue && !errors.username;
  const isEmailValid = emailValue && !errors.email;
  const isPasswordValid = passwordValue && !errors.password;
  const isRoleValid = roleValue && !errors.role;

  const roleOptions = [
    { value: "USER", label: t("User") },
    { value: "PLAYER", label: t("Player") },
    { value: "SCOUT", label: t("Scout") },
    { value: "AGENT", label: t("Agent") },
    { value: "CLUB", label: t("Club") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="mb-5 sm:mb-6">
        <label className="text-gray-200 font-semibold text-sm block mb-1">
          {t("Username")}
        </label>
        <div
          className={`flex items-center bg-white/30 rounded-xl px-3 sm:px-4 transition-all duration-200 ${
            errors.username && touchedFields.username
              ? "border-2 border-red-500 ring-2 ring-red-500/20"
              : isUsernameValid && touchedFields.username
              ? "border-2 border-green-500"
              : "border border-transparent"
          }`}
        >
          <User size={18} className="text-blue-900 mr-2 sm:mr-3" />
          <input
            type="text"
            placeholder={t("Choose a username")}
            className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base placeholder:text-gray-400"
            {...register("username")}
          />
          {isUsernameValid && touchedFields.username && (
            <CheckCircle size={18} className="text-green-500 ml-2" />
          )}
        </div>
        {errors.username && touchedFields.username && (
          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.username.message}
          </p>
        )}
      </div>

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

      <div className="mb-5 sm:mb-6">
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
            placeholder={t("Create a password")}
            className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base placeholder:text-gray-400"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-blue-900 hover:text-yellow-400 transition"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {isPasswordValid && touchedFields.password && (
            <CheckCircle size={18} className="text-green-500 ml-2" />
          )}
        </div>
        {errors.password && touchedFields.password && (
          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="mb-5 sm:mb-6">
        <label className="text-gray-200 font-semibold text-sm block mb-3">
          {t("Select Role")}
        </label>

        <div className="grid grid-cols-2 gap-3">
          {roleOptions.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() =>
                form.setValue("role", role.value as RegisterFormData["role"], {
                  shouldValidate: true,
                })
              }
              className={`rounded-xl p-3 border transition-all duration-300 ${
                roleValue === role.value
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        {errors.role && touchedFields.role && (
          <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.role.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid}
        className={`w-full py-2.5 sm:py-3 bg-[#0b2a6b] text-white rounded-xl border-l-4 border-r-4 border-yellow-400 font-semibold transition-all duration-200 shadow-lg ${
          isLoading || !isValid
            ? "opacity-50 cursor-not-allowed"
            : "hover:opacity-90 hover:shadow-yellow-400/20"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t("Registering...")}
          </span>
        ) : (
          t("Register")
        )}
      </button>
    </form>
  );
}