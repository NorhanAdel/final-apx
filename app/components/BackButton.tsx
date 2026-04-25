"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";

interface BackButtonProps {
  defaultUrl?: string;
  className?: string;
}

export default function BackButton({
  defaultUrl,
  className = "",
}: BackButtonProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();

  const handleBack = () => {
    if (defaultUrl) {
      router.push(defaultUrl);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
        theme === "dark"
          ? "bg-[#0a0f2c] hover:bg-[#1e2a5a] text-white"
          : "bg-white shadow hover:bg-gray-50 text-black"
      } ${className}`}
    >
      <ArrowLeft size={18} />
      {t("Back") || "Back"}
    </button>
  );
}
