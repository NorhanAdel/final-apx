"use client";

import React from "react";
import { Award } from "lucide-react";

interface AgeCategoryBadgeProps {
  ageCategoryName?: string | null;
  ageCategoryCode?: string | null;
  className?: string;
  showIcon?: boolean;
}

const VALID_CODES = ["U11", "U13", "U15", "U17", "U19", "SENIOR"] as const;
type AgeCode = (typeof VALID_CODES)[number];

export default function AgeCategoryBadge({
  ageCategoryName,
  ageCategoryCode,
  className = "",
  showIcon = true,
}: AgeCategoryBadgeProps) {
  if (!ageCategoryName && !ageCategoryCode) {
    return null;
  }

  const code: AgeCode =
    ageCategoryCode && (VALID_CODES as readonly string[]).includes(ageCategoryCode.toUpperCase())
      ? (ageCategoryCode.toUpperCase() as AgeCode)
      : "SENIOR";

  const displayName = ageCategoryName || code;

  const getBadgeColors = (c: AgeCode) => {
    switch (c) {
      case "U11":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "U13":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "U15":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "U17":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "U19":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "SENIOR":
      default:
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/40";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md shadow-sm transition-all ${getBadgeColors(
        code,
      )} ${className}`}
    >
      {showIcon && <Award size={13} className="shrink-0" />}
      <span>{displayName}</span>
    </span>
  );
}