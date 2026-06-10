"use client";

import Image from "next/image";
import { Star, MapPin, User, TrendingUp, Crown, Gem, Award, Shield, Medal, Zap } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";

/* ──────────────────────────────────────────
   Per-level visual identity
   ────────────────────────────────────────── */
interface LevelStyle {
  border: string;
  hoverBorder: string;
  shadow: string;
  hoverShadow: string;
  scoreBadgeBg: string;
  scoreBadgeText: string;
  levelBadgeBg: string;
  levelBadgeText: string;
  accentColor: string;
  starFill: string;
  overlayTint: string;        // subtle color overlay on image
  icon: React.ElementType;
  ringGlow?: string;          // animated ring for top tiers
}

const levelStyles: Record<string, LevelStyle> = {
  S7_7: {
    border: "border-yellow-400/50",
    hoverBorder: "hover:border-yellow-400",
    shadow: "shadow-yellow-400/10",
    hoverShadow: "hover:shadow-[0_0_30px_rgba(251,191,36,0.25)]",
    scoreBadgeBg: "bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400",
    scoreBadgeText: "text-black",
    levelBadgeBg: "bg-gradient-to-r from-yellow-400 to-amber-500",
    levelBadgeText: "text-black",
    accentColor: "text-yellow-400",
    starFill: "fill-yellow-300 text-yellow-300",
    overlayTint: "from-yellow-900/20 via-transparent to-transparent",
    icon: Crown,
    ringGlow: "shadow-[inset_0_0_20px_rgba(251,191,36,0.15)]",
  },
  S7_6: {
    border: "border-purple-400/40",
    hoverBorder: "hover:border-purple-400",
    shadow: "shadow-purple-400/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]",
    scoreBadgeBg: "bg-gradient-to-r from-purple-500 to-violet-500",
    scoreBadgeText: "text-white",
    levelBadgeBg: "bg-gradient-to-r from-purple-400 to-violet-500",
    levelBadgeText: "text-white",
    accentColor: "text-purple-400",
    starFill: "fill-purple-400 text-purple-400",
    overlayTint: "from-purple-900/20 via-transparent to-transparent",
    icon: Gem,
    ringGlow: "shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]",
  },
  S7_5: {
    border: "border-cyan-400/35",
    hoverBorder: "hover:border-cyan-400",
    shadow: "shadow-cyan-400/10",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.18)]",
    scoreBadgeBg: "bg-gradient-to-r from-cyan-500 to-teal-500",
    scoreBadgeText: "text-white",
    levelBadgeBg: "bg-gradient-to-r from-cyan-400 to-teal-500",
    levelBadgeText: "text-white",
    accentColor: "text-cyan-400",
    starFill: "fill-cyan-400 text-cyan-400",
    overlayTint: "from-cyan-900/15 via-transparent to-transparent",
    icon: Star,
  },
  S7_4: {
    border: "border-emerald-400/30",
    hoverBorder: "hover:border-emerald-400",
    shadow: "shadow-emerald-400/10",
    hoverShadow: "hover:shadow-[0_0_18px_rgba(52,211,153,0.15)]",
    scoreBadgeBg: "bg-gradient-to-r from-emerald-500 to-green-500",
    scoreBadgeText: "text-white",
    levelBadgeBg: "bg-gradient-to-r from-emerald-400 to-green-500",
    levelBadgeText: "text-white",
    accentColor: "text-emerald-400",
    starFill: "fill-emerald-400 text-emerald-400",
    overlayTint: "from-emerald-900/10 via-transparent to-transparent",
    icon: Award,
  },
  S7_3: {
    border: "border-blue-400/25",
    hoverBorder: "hover:border-blue-400/60",
    shadow: "shadow-blue-400/5",
    hoverShadow: "hover:shadow-[0_0_15px_rgba(96,165,250,0.12)]",
    scoreBadgeBg: "bg-gradient-to-r from-blue-500 to-sky-500",
    scoreBadgeText: "text-white",
    levelBadgeBg: "bg-gradient-to-r from-blue-400 to-sky-500",
    levelBadgeText: "text-white",
    accentColor: "text-blue-400",
    starFill: "fill-blue-400 text-blue-400",
    overlayTint: "from-blue-900/10 via-transparent to-transparent",
    icon: Shield,
  },
  S7_2: {
    border: "border-orange-400/20",
    hoverBorder: "hover:border-orange-400/50",
    shadow: "shadow-orange-400/5",
    hoverShadow: "hover:shadow-[0_0_12px_rgba(251,146,60,0.1)]",
    scoreBadgeBg: "bg-gradient-to-r from-orange-500 to-amber-500",
    scoreBadgeText: "text-white",
    levelBadgeBg: "bg-gradient-to-r from-orange-400 to-amber-500",
    levelBadgeText: "text-white",
    accentColor: "text-orange-400",
    starFill: "fill-orange-400 text-orange-400",
    overlayTint: "from-orange-900/5 via-transparent to-transparent",
    icon: Medal,
  },
  S7_1: {
    border: "border-slate-400/15",
    hoverBorder: "hover:border-slate-400/40",
    shadow: "shadow-slate-400/5",
    hoverShadow: "hover:shadow-[0_0_10px_rgba(148,163,184,0.08)]",
    scoreBadgeBg: "bg-gradient-to-r from-slate-500 to-zinc-500",
    scoreBadgeText: "text-white",
    levelBadgeBg: "bg-gradient-to-r from-slate-400 to-zinc-500",
    levelBadgeText: "text-white",
    accentColor: "text-slate-400",
    starFill: "fill-slate-400 text-slate-400",
    overlayTint: "from-slate-900/5 via-transparent to-transparent",
    icon: Zap,
  },
};

const defaultStyle: LevelStyle = levelStyles.S7_1;

function getLevelStyle(level?: string): LevelStyle {
  if (!level) return defaultStyle;
  return levelStyles[level] || defaultStyle;
}

/* ──────────────────────────────────────────
   Component
   ────────────────────────────────────────── */
interface ScalePlayerCardProps {
  id: string;
  name: string;
  level?: string;
  profileImageUrl?: string;
  nationality?: string;
  age?: number;
  super7Score?: number;
  levelTitle?: string;
  position?: string;
  averageStars?: number;
  onClick?: () => void;
}

export default function ScalePlayerCard({
  name,
  level,
  profileImageUrl,
  nationality,
  age,
  super7Score,
  levelTitle,
  position,
  averageStars,
  onClick,
}: ScalePlayerCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";
  const style = getLevelStyle(level);

  const levelNum = level ? parseInt(level.replace("S7_", "")) : 1;
  const isTopTier = levelNum >= 6;
  const isMidTier = levelNum >= 4 && levelNum < 6;

  const bgColor = isDark ? "bg-[#030712]" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-600";

  const image = profileImageUrl
    ? profileImageUrl.startsWith("http")
      ? profileImageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${profileImageUrl}`
    : "/b2.jpg";

  const maxStars = 7;
  const starRating = averageStars || 0;
  const LevelIcon = style.icon;

  return (
    <div
      onClick={onClick}
      className={`relative group overflow-hidden rounded-xl ${bgColor} border ${style.border} shadow-lg ${style.shadow} transition-all duration-400 ${style.hoverBorder} ${style.hoverShadow} cursor-pointer ${isTopTier ? "hover:scale-[1.03]" : "hover:scale-[1.02]"}`}
    >
      {/* Top-tier animated border glow */}
      {isTopTier && (
        <div
          className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
            levelNum === 7
              ? "shadow-[inset_0_0_30px_rgba(251,191,36,0.15)]"
              : "shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]"
          }`}
        />
      )}

      {/* Image */}
      <div className="relative aspect-[4/5] w-full bg-[#c2a33e]">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover object-top transition-all duration-500 ${
            isTopTier
              ? "grayscale-0"
              : "grayscale-[20%] group-hover:grayscale-0"
          }`}
        />
        {/* Level-colored overlay tint */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${style.overlayTint} opacity-60 pointer-events-none`}
        />
        {/* Bottom fade */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${isDark ? "from-[#030712]" : "from-white"} via-transparent to-transparent opacity-90`}
        />

        {/* Super7 Score badge — styled per level */}
        {super7Score !== undefined && (
          <div
            className={`absolute top-3 right-3 ${style.scoreBadgeBg} ${style.scoreBadgeText} text-xs font-black px-2.5 py-1 rounded-lg shadow-lg ${
              isTopTier ? "shadow-lg" : ""
            }`}
          >
            S7: {super7Score}
          </div>
        )}

        {/* Level badge — styled per level */}
        {levelTitle && (
          <div
            className={`absolute top-3 left-3 ${style.levelBadgeBg} ${style.levelBadgeText} backdrop-blur-sm text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md`}
          >
            <LevelIcon size={12} />
            {levelTitle}
          </div>
        )}

        {/* Top-tier corner sparkle */}
        {levelNum === 7 && (
          <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-300 animate-ping opacity-60" />
            <div className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping opacity-40 delay-700" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Name + Stars */}
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-lg font-black italic uppercase tracking-tighter ${textColor} line-clamp-1`}
          >
            {name}
          </h3>
          {starRating > 0 && (
            <div className="flex gap-0.5 flex-shrink-0 ml-2">
              {[...Array(maxStars)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={
                    i < Math.round(starRating)
                      ? style.starFill
                      : isDark
                        ? "fill-gray-600 text-gray-600"
                        : "fill-gray-300 text-gray-300"
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Info row */}
        <div
          className={`flex items-center justify-between text-[10px] font-bold italic ${textSecondary}`}
        >
          {position && (
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className={style.accentColor} />
              <span>{position}</span>
            </div>
          )}
          {nationality && (
            <div className="flex items-center gap-1">
              <MapPin size={12} className={style.accentColor} />
              <span>{nationality}</span>
            </div>
          )}
          {age !== undefined && age > 0 && (
            <div className="flex items-center gap-1">
              <User size={12} className={style.accentColor} />
              <span>
                {age} {t("Y")}
              </span>
            </div>
          )}
        </div>

        {/* Level indicator bar — thickness & color varies */}
        <div className={`mt-3 h-[2px] rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-200"}`}>
          <div
            className={`h-full rounded-full ${style.scoreBadgeBg}`}
            style={{ width: `${Math.min((levelNum / 7) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
