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
    { value: "USER", label: "User" },
    { value: "PLAYER", label: "Player" },
    { value: "SCOUT", label: "Scout" },
    { value: "AGENT", label: "Agent" },
    { value: "CLUB", label: "Club" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Username Field */}
      <div className="mb-5 sm:mb-6">
        <label className="text-gray-200 font-semibold text-sm block mb-1">
          Username
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
            placeholder="Choose a username"
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

      {/* Email Field */}
      <div className="mb-5 sm:mb-6">
        <label className="text-gray-200 font-semibold text-sm block mb-1">
          Email
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
            placeholder="Enter your email address"
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

      {/* Password Field */}
      <div className="mb-5 sm:mb-6">
        <label className="text-gray-200 font-semibold text-sm block mb-1">
          Password
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
            placeholder="Create a password"
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

      {/* Role Field */}
      <div className="mb-5 sm:mb-6">
        <label className="text-gray-200 font-semibold text-sm block mb-1">
          Role
        </label>
        <div
          className={`bg-white/30 rounded-xl px-3 sm:px-4 transition-all duration-200 ${
            errors.role && touchedFields.role
              ? "border-2 border-red-500 ring-2 ring-red-500/20"
              : isRoleValid && touchedFields.role
              ? "border-2 border-green-500"
              : "border border-transparent"
          }`}
        >
          <select
            className="w-full py-2 sm:py-3 bg-transparent outline-none text-white text-sm sm:text-base"
            {...register("role")}
          >
            {roleOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="text-black"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {errors.role && touchedFields.role && (
          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
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
            Registering...
          </span>
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
}
