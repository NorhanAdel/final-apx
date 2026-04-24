"use client";

import React from "react";
import { useTheme } from "@/app/context/ThemeContext";

interface Player {
  first_name: string;
  last_name: string;
  date_of_birth?: string | Date | null;
  age?: number | null;
  city?: string | null;
  country?: string | null;
  nationality?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  email_address?: string | null;
  phone?: string | null;
  bio?: string | null;
  trust_level?: string | null;
  views_count?: number | null;
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
  const isDark = theme === "dark";

  if (!player) return null;

  // Helper function to calculate age from date of birth
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
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const textColor = isDark ? "text-gray-300" : "text-gray-700";

  const hasStats =
    (player.views_count ?? 0) > 0 ||
    player.trust_level ||
    (player.country && player.city);
  const hasBio = !!player.bio;

  // Use age from API if available, otherwise calculate from date_of_birth
  const displayAge = player.age ?? calculateAge(player.date_of_birth);

  return (
    <div className="mt-6 space-y-6">
      {/* Bio & Stats Section */}
      {(hasBio || hasStats) && (
        <div>
          {hasBio && (
            <h3 className="text-yellow-400 font-semibold mb-3">Bio</h3>
          )}
          {hasBio && (
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
              <span>👁️ {player.views_count} views</span>
            )}
            {player.trust_level && <span>🏆 {player.trust_level} level</span>}
            {player.country && player.city && (
              <span>
                📍 {player.city}, {player.country}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div>
        <h3 className="text-yellow-400 font-semibold mb-3">
          Personal Information
        </h3>
        <ul className="space-y-2 text-sm">
          <li className={textColor}>
            <strong>Full Name:</strong> {player.first_name} {player.last_name}
          </li>
          <li className={textColor}>
            <strong>Date of Birth:</strong> {formatDate(player.date_of_birth)}
          </li>
          <li className={textColor}>
            <strong>Age:</strong> {displayAge ?? "N/A"}
          </li>
          <li className={textColor}>
            <strong>Place of Birth:</strong> {player.city || "Unknown"},{" "}
            {player.country || "Unknown"}
          </li>
          <li className={textColor}>
            <strong>Nationality:</strong> {player.nationality || "N/A"}
          </li>
          <li className={textColor}>
            <strong>Height:</strong>{" "}
            {player.height_cm
              ? `${(player.height_cm / 100).toFixed(2)} m`
              : "N/A"}
          </li>
          <li className={textColor}>
            <strong>Weight:</strong>{" "}
            {player.weight_kg ? `${player.weight_kg} kg` : "N/A"}
          </li>
          {showContact && (
            <li className={textColor}>
              <strong>Email:</strong> {player.email_address || "N/A"}
            </li>
          )}
          {showContact && (
            <li className={textColor}>
              <strong>Phone:</strong> {player.phone || "N/A"}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
