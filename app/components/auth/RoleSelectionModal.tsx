"use client";

import { X, CheckCircle } from "lucide-react";
import { useState } from "react";
import useTranslate from "@/app/hooks/useTranslate";

export type RoleType = "PLAYER" | "SCOUT" | "AGENT" | "CLUB" | "USER";

interface RoleOption {
  value: RoleType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (role: RoleType) => Promise<void>;
  userEmail: string;
  username: string;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

const roleOptions: RoleOption[] = [
  {
    value: "USER",
    label: "User",
    icon: "👤",
    description: "Regular user with basic access",
    color: "from-gray-500 to-gray-600",
  },
  {
    value: "PLAYER",
    label: "Player",
    icon: "⚽",
    description: "Football player looking for opportunities",
    color: "from-green-500 to-green-600",
  },
  {
    value: "SCOUT",
    label: "Scout",
    icon: "🔍",
    description: "Talent scout searching for players",
    color: "from-blue-500 to-blue-600",
  },
  {
    value: "AGENT",
    label: "Agent",
    icon: "📋",
    description: "Player agent representing talent",
    color: "from-purple-500 to-purple-600",
  },
  {
    value: "CLUB",
    label: "Club",
    icon: "🏛️",
    description: "Football club representative",
    color: "from-red-500 to-red-600",
  },
];

export default function RoleSelectionModal({
  isOpen,
  onClose,
  onSubmit,
  userEmail,
  username,
  isLoading = false,
  title = "Choose Your Account Type",
  subtitle = "Select the role that best describes you",
}: RoleSelectionModalProps) {
  const { t } = useTranslate();
  const [selectedRole, setSelectedRole] = useState<RoleType>("USER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(selectedRole);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = isLoading || isSubmitting;

  // Translated role options
  const translatedRoleOptions = roleOptions.map((role) => ({
    ...role,
    label: t(role.label),
    description: t(role.description),
  }));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0a0e2e] to-[#12163e] rounded-2xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isPending}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50 z-10"
          >
            <X size={24} />
          </button>

          {/* Header with Logo */}
          <div className="p-6 border-b border-white/10 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center">
                <span className="text-3xl">⚡</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              {t(title)}
            </h3>
            <p className="text-gray-300 text-sm mt-2">{t(subtitle)}</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* User Info Preview */}
            <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-gray-300 text-xs mb-1">
                <span>📧</span>
                <span>{t("Email")}:</span>
              </div>
              <p className="text-white font-medium text-sm break-all">
                {userEmail}
              </p>

              <div className="flex items-center gap-2 text-gray-300 text-xs mt-2 mb-1">
                <span>👤</span>
                <span>{t("Username")}:</span>
              </div>
              <p className="text-white font-medium text-sm">{username}</p>
            </div>

            {/* Role Selection Cards */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-3">
                {t("Select your role")} <span className="text-red-400">*</span>
              </label>

              <div className="grid gap-3">
                {translatedRoleOptions.map((role) => (
                  <RoleCard
                    key={role.value}
                    role={role}
                    isSelected={selectedRole === role.value}
                    onSelect={() => setSelectedRole(role.value)}
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex gap-3 bg-black/20">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
            >
              {t("Cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#0a0e2e] font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-yellow-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0a0e2e] border-t-transparent rounded-full animate-spin" />
                  {t("Creating Account...")}
                </span>
              ) : (
                t("Continue")
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Sub-component for Role Card
interface RoleCardProps {
  role: RoleOption & { label: string; description: string };
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function RoleCard({ role, isSelected, onSelect, disabled }: RoleCardProps) {
  return (
    <label
      className={`flex items-start p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? `bg-gradient-to-r ${role.color}/20 border-yellow-400 shadow-lg shadow-yellow-400/10`
          : "bg-white/10 border-transparent hover:bg-white/20"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="radio"
        name="role"
        value={role.value}
        checked={isSelected}
        onChange={onSelect}
        disabled={disabled}
        className="mt-1 w-4 h-4 text-yellow-400 focus:ring-yellow-400 disabled:opacity-50"
      />
      <div className="ml-3 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{role.icon}</span>
          <span className="font-semibold text-white">{role.label}</span>
          {isSelected && (
            <CheckCircle size={16} className="text-yellow-400 ml-auto" />
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1">{role.description}</p>
      </div>
    </label>
  );
}