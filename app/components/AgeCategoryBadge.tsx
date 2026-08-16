"use client";

import React from "react";
import { Award } from "lucide-react";
import { getAgeCategory } from "../utils/ageCategory";
import useTranslate from "@/app/hooks/useTranslate";

interface AgeCategoryBadgeProps {
  dateOfBirth?: string | Date | null;
  ageCategoryName?: string | null;
  className?: string;
  showIcon?: boolean;
  lang?: string;
}

export default function AgeCategoryBadge({
  dateOfBirth,
  ageCategoryName,
  className = "",
  showIcon = true,
  lang: propLang,
}: AgeCategoryBadgeProps) {
  const { t, lang: contextLang } = useTranslate();
  
  const lang = propLang || contextLang;

  // Get category code
  const categoryInfo = getAgeCategory(dateOfBirth);

  // Map ageCategoryName to code if provided from server
  const getCodeFromName = (name: string): string => {
    const map: Record<string, string> = {
      "فريق أول": "SENIOR",
      "الكبار": "SENIOR",
      "First Team": "SENIOR",
      "Senior": "SENIOR",
      "تحت 23": "U23",
      "Under 23": "U23",
      "تحت 21": "U21",
      "Under 21": "U21",
      "تحت 19": "U19",
      "Under 19": "U19",
      "تحت 17": "U17",
      "Under 17": "U17",
      "تحت 15": "U15",
      "Under 15": "U15",
      "تحت 13": "U13",
      "Under 13": "U13",
      "تحت 11": "U11",
      "Under 11": "U11",
      "الناشئين": "YOUTH",
      "Youth": "YOUTH",
    };
    return map[name] || "SENIOR";
  };

  // Determine the code
  let code = categoryInfo?.code || "SENIOR";
  if (ageCategoryName) {
    code = getCodeFromName(ageCategoryName) as any;
  }

  // Get translated name using useTranslate
  const translatedName = t(code);

  const getBadgeColors = (code: string) => {
    switch (code) {
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
      <span>{translatedName}</span>
    </span>
  );
}