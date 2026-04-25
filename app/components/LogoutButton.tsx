"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { LOGOUT_MUTATION } from "../graphql/mutation/auth.mutations";
import { fetchGraphQL } from "../lib/fetchGraphQL";

interface LogoutButtonProps {
  variant?: "default" | "text" | "icon";
  className?: string;
  redirectTo?: string;
  onLogoutSuccess?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "default",
  className = "",
  redirectTo = "/auth/login",
  onLogoutSuccess,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Call logout mutation
      const result = await fetchGraphQL<{ logout: boolean }>(LOGOUT_MUTATION);

      if (result.errors) {
        console.error("Logout mutation error:", result.errors);
        toast.error(t("Failed to logout"));
      } else {
        toast.success(t("Logged out successfully!"));
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(t("Failed to logout"));
    } finally {
      // Clear local storage regardless of mutation success
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("pending_email");
      localStorage.removeItem("remember_me");

      if (onLogoutSuccess) {
        onLogoutSuccess();
      }

      router.push(redirectTo);
      setLoading(false);
      setShowLogoutModal(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 transition-all duration-200";

    if (variant === "text") {
      return `${baseStyles} px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`;
    }
    if (variant === "icon") {
      return `${baseStyles} p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 ${className}`;
    }
    return `${baseStyles} justify-between items-center border-x-3 border-[#F0B100] p-3 rounded-md
      ${
        theme === "dark" ? "bg-[#0B1739] text-white" : "bg-gray-100 text-black"
      } ${className}`;
  };

  return (
    <>
      <button
        onClick={() => setShowLogoutModal(true)}
        className={getButtonStyles()}
        disabled={loading}
      >
        <span className="text-sm">{variant !== "icon" && t("Logout")}</span>
        <LogOut size={18} className="text-red-600" />
      </button>

      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              transition={{ duration: 0.3 }}
              className={`relative w-[90%] max-w-sm p-6 rounded-xl text-center
                ${theme === "dark" ? "bg-[#050B18]" : "bg-white"}`}
            >
              <button
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
              >
                <X size={20} />
              </button>

              <div className="flex items-center justify-center gap-2 mb-3">
                <h2 className="text-xl font-bold">{t("Logout")}</h2>
              </div>

              <p className="text-gray-400 mb-6 text-sm">
                {t("Are you sure you want to logout?")}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`flex-1 py-2 rounded-md transition
                    ${
                      theme === "dark"
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-300 text-black hover:bg-gray-400"
                    }`}
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className={`flex-1 py-2 rounded-md transition flex items-center justify-center gap-2
                    bg-red-600 text-white hover:bg-red-700 hover:scale-105
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    t("Logout")
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
