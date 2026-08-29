"use client";

import React from "react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import AgeCategoryBadge from "./AgeCategoryBadge";

interface Player {
  first_name: string;
  last_name: string;
  date_of_birth?: string | Date | null;
  age?: number | null;
  age_category_code?: string | null;
  age_category_name?: string | null;
  city?: string | null;
  country?: string | null;
  nationality?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  email_address?: string | null;
  phone?: string | null;
  bio?: string | null;
  super7_level?: string | null;
  views_count?: number | null;
  contract_status_info?: {
    contract_status_label?: string | null;
    has_official_agent?: boolean;
    official_agent_name?: string | null;
  } | null;
}

interface PersonalInfoProps {
  player: Player | null | undefined;
  showContact?: boolean;
}

export default function PersonalInfo({
  player,
  showContact = false,
}: PersonalInfoProps) {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  if (!player) return null;

  const calculateAge = (birthDate?: string | Date | null): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return t("N/A");
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return t("N/A");
    }
  };

  const textColor = isDark ? "text-gray-300" : "text-gray-700";
  const displayAge = player.age ?? calculateAge(player.date_of_birth);

  return (
    <div className="mt-6 space-y-6">
      {(player.bio ||
        (player.views_count ?? 0) > 0 ||
        player.super7_level ||
        (player.country && player.city)) && (
        <div>
          {player.bio && (
            <h3 className="text-yellow-400 font-semibold mb-3">{t("Bio")}</h3>
          )}
          {player.bio && (
            <p
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              } leading-relaxed`}
            >
              {player.bio}
            </p>
          )}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
            {(player.views_count ?? 0) > 0 && (
              <span>
                👁️ {player.views_count} {t("views")}
              </span>
            )}
            {player.super7_level && (
              <span>
                🏆 {player.super7_level} {t("level")}
              </span>
            )}
            {player.country && player.city && (
              <span>
                📍 {player.city}, {player.country}
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-yellow-400 font-semibold mb-3">
          {t("Personal Information")}
        </h3>
        <ul className="space-y-2 text-sm">
          <li className={textColor}>
            <strong>{t("Full Name")}:</strong> {player.first_name}{" "}
            {player.last_name}
          </li>
          <li className={textColor}>
            <strong>{t("Date of Birth")}:</strong>{" "}
            {formatDate(player.date_of_birth)}
          </li>
          <li className={textColor}>
            <strong>{t("Age")}:</strong> {displayAge ?? t("N/A")}
          </li>
          <li className={`flex items-center gap-2 ${textColor}`}>
            <strong>{t("Age Category")}:</strong>{" "}
            <AgeCategoryBadge
              ageCategoryCode={player.age_category_code}
              ageCategoryName={player.age_category_name}
            />
          </li>
          <li className={textColor}>
            <strong>{t("Place of Birth")}:</strong>{" "}
            {player.city || t("Unknown")}, {player.country || t("Unknown")}
          </li>
          <li className={textColor}>
            <strong>{t("Nationality")}:</strong>{" "}
            {player.nationality || t("N/A")}
          </li>
          <li className={textColor}>
            <strong>{t("Height")}:</strong>{" "}
            {player.height_cm
              ? `${(player.height_cm / 100).toFixed(2)} ${t("cm")}`
              : t("N/A")}
          </li>
          <li className={textColor}>
            <strong>{t("Weight")}:</strong>{" "}
            {player.weight_kg ? `${player.weight_kg} ${t("kg")}` : t("N/A")}
          </li>
          {player.contract_status_info?.contract_status_label && (
            <li className={textColor}>
              <strong>{t("Contract Status")}:</strong>{" "}
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 ml-1">
                {player.contract_status_info.contract_status_label}
              </span>
            </li>
          )}
          {player.contract_status_info?.has_official_agent &&
            player.contract_status_info?.official_agent_name && (
              <li className={textColor}>
                <strong>{t("Official Agent")}:</strong>{" "}
                {player.contract_status_info.official_agent_name}
              </li>
            )}
          {showContact && (
            <li className={textColor}>
              <strong>{t("Email")}:</strong> {player.email_address || t("N/A")}
            </li>
          )}
          {showContact && (
            <li className={textColor}>
              <strong>{t("Phone")}:</strong> {player.phone || t("N/A")}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
