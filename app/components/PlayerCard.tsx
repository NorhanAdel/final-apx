"use client";

import React from "react";
import Image from "next/image";
import { Star, Trophy, MapPin, User } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import AgeCategoryBadge from "./AgeCategoryBadge";

interface PlayerCardProps {
  name: string;
  image: string;
  rating: number;
  age: number;
  country: string;
  super7Score: number;
  position: string;
  ageCategoryCode?: string | null;
  ageCategoryName?: string | null;
}

export const PlayerCard = ({
  name,
  image,
  rating,
  position,
  country,
  age,
  super7Score,
  ageCategoryCode,
  ageCategoryName,
}: PlayerCardProps) => {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const bgColor = isDark ? "bg-[#030712]" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
  const borderColor = isDark ? "border-white/5" : "border-gray-200";
  const hoverBorderColor = isDark
    ? "hover:border-[#eab308]/30"
    : "hover:border-yellow-400/50";
  const gradientFrom = isDark ? "from-[#030712]" : "from-white";
  const starFillColor = isDark
    ? "fill-[#eab308] text-[#eab308]"
    : "fill-yellow-500 text-yellow-500";
  const starEmptyColor = isDark
    ? "fill-gray-600 text-gray-600"
    : "fill-gray-300 text-gray-300";
  const maxStars = 7;

  return (
    <div
      className={`relative group overflow-hidden rounded-xl ${bgColor} border ${borderColor} shadow-lg transition-all duration-300 ${hoverBorderColor}`}
    >
      <div className="relative aspect-[4/5] w-full bg-[#c2a33e]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-top grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${gradientFrom} via-transparent to-transparent opacity-90`}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-2xl font-black italic uppercase tracking-tighter ${textColor}`}
          >
            {name}
          </h3>

          <div className="flex gap-0.5">
            {[...Array(maxStars)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={`${i < rating ? starFillColor : starEmptyColor}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <AgeCategoryBadge
            ageCategoryCode={ageCategoryCode}
            ageCategoryName={ageCategoryName}
          />
        </div>

        <div
          className={`flex items-center justify-between text-[10px] font-bold italic ${textSecondary}`}
        >

    <div className="px-2 py-1 rounded-full bg-[#eab308]/20 border border-[#eab308]/40">
      <span className="text-[#eab308] text-xs font-bold">
        S7Score {super7Score}
      </span>
    </div>
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-[#eab308]" />
            <span>{t(position)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#eab308]" />
            <span>{country}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-[#eab308]" />
            <span>
              {age} {t("Y")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};