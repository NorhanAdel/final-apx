"use client";

import Image from "next/image";
import { CheckCircle } from "lucide-react";

interface GoogleRegisterButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  label?: string;
  className?: string;
}

export default function GoogleRegisterButton({
  onClick,
  isLoading = false,
  isSuccess = false,
  label = "Register With Google",
  className = "",
}: GoogleRegisterButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || isSuccess}
      className={`w-full py-2.5 sm:py-3 rounded-xl border border-white/20 text-white flex items-center justify-center gap-3 hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group ${className}`}
    >
      <Image
        src="/icons8-google-48.png"
        alt="Google Icon"
        width={20}
        height={20}
        className="w-4 h-4 sm:w-5 sm:h-5 object-contain group-hover:scale-105 transition"
      />
      {isLoading ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : isSuccess ? (
        <span className="flex items-center gap-2">
          <CheckCircle size={16} />
          OTP Sent! Redirecting...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
