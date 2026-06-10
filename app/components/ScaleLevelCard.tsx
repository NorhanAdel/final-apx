"use client";

import { motion } from "framer-motion";
import { Crown, Star, Gem, Award, Shield, Medal, Zap } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";

interface LevelTheme {
  gradient: string;
  border: string;
  glow: string;
  icon: React.ElementType;
  iconColor: string;
  badge: string;
}

const levelThemes: Record<string, LevelTheme> = {
  S7_7: {
    gradient: "from-yellow-500/20 via-amber-500/10 to-orange-500/20",
    border: "border-yellow-400/60",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.3)]",
    icon: Crown,
    iconColor: "text-yellow-400",
    badge: "bg-gradient-to-r from-yellow-400 to-amber-500",
  },
  S7_6: {
    gradient: "from-purple-500/20 via-violet-500/10 to-indigo-500/20",
    border: "border-purple-400/50",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.25)]",
    icon: Gem,
    iconColor: "text-purple-400",
    badge: "bg-gradient-to-r from-purple-400 to-violet-500",
  },
  S7_5: {
    gradient: "from-cyan-500/20 via-teal-500/10 to-emerald-500/20",
    border: "border-cyan-400/50",
    glow: "shadow-[0_0_25px_rgba(34,211,238,0.2)]",
    icon: Star,
    iconColor: "text-cyan-400",
    badge: "bg-gradient-to-r from-cyan-400 to-teal-500",
  },
  S7_4: {
    gradient: "from-emerald-500/20 via-green-500/10 to-lime-500/20",
    border: "border-emerald-400/40",
    glow: "shadow-[0_0_20px_rgba(52,211,153,0.2)]",
    icon: Award,
    iconColor: "text-emerald-400",
    badge: "bg-gradient-to-r from-emerald-400 to-green-500",
  },
  S7_3: {
    gradient: "from-blue-500/20 via-sky-500/10 to-indigo-500/20",
    border: "border-blue-400/40",
    glow: "shadow-[0_0_15px_rgba(96,165,250,0.15)]",
    icon: Shield,
    iconColor: "text-blue-400",
    badge: "bg-gradient-to-r from-blue-400 to-sky-500",
  },
  S7_2: {
    gradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
    border: "border-orange-400/30",
    glow: "shadow-[0_0_10px_rgba(251,146,60,0.15)]",
    icon: Medal,
    iconColor: "text-orange-400",
    badge: "bg-gradient-to-r from-orange-400 to-amber-500",
  },
  S7_1: {
    gradient: "from-slate-500/20 via-gray-500/10 to-zinc-500/20",
    border: "border-slate-400/25",
    glow: "shadow-[0_0_8px_rgba(148,163,184,0.1)]",
    icon: Zap,
    iconColor: "text-slate-400",
    badge: "bg-gradient-to-r from-slate-400 to-zinc-500",
  },
};

interface ScaleLevelCardProps {
  level: string;
  title: string;
  description: string;
  minScore: number;
  maxScore: number;
  isHighest?: boolean;
  index?: number;
  onClick?: () => void;
}

export default function ScaleLevelCard({
  level,
  title,
  description,
  minScore,
  maxScore,
  isHighest = false,
  index = 0,
  onClick,
}: ScaleLevelCardProps) {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const themeConfig = levelThemes[level] || levelThemes.S7_1;
  const Icon = themeConfig.icon;
  const levelNumber = level.replace("S7_", "");

  if (isHighest) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        onClick={onClick}
        className={`relative cursor-pointer col-span-full rounded-2xl overflow-hidden border-2 ${themeConfig.border} ${themeConfig.glow} transition-all duration-500 hover:scale-[1.02]`}
      >
        {/* Animated background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${themeConfig.gradient} ${isDark ? "opacity-100" : "opacity-60"}`}
        />
        <div
          className={`absolute inset-0 ${isDark ? "bg-[#020617]/60" : "bg-white/60"}`}
        />

        {/* Pulsing glow ring */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-yellow-400/10 animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-amber-400/10 animate-pulse delay-500" />

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          {/* Icon section */}
          <div className="relative flex-shrink-0">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div
                className={`w-28 h-28 rounded-full ${themeConfig.badge} flex items-center justify-center shadow-2xl`}
              >
                <Icon size={52} className="text-white drop-shadow-lg" />
              </div>
              {/* Orbiting sparkle */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0"
              >
                <div className="absolute -top-2 left-1/2 w-3 h-3 rounded-full bg-yellow-300 shadow-lg shadow-yellow-400/50" />
              </motion.div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${themeConfig.badge} text-white`}
              >
                {t("Level")} {levelNumber}
              </span>
              <span className="text-xs font-semibold text-yellow-400 animate-pulse">
                ★ {t("HIGHEST TIER")}
              </span>
            </div>
            <h2
              className={`text-3xl md:text-4xl font-black uppercase tracking-tight mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h2>
            <p
              className={`text-sm md:text-base leading-relaxed mb-4 max-w-2xl ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              {description}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}
              >
                {t("Score Range")}: {minScore} — {maxScore}
              </span>
              <span className="text-xs text-yellow-500 font-bold">
                {t("View Players")} →
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl overflow-hidden border ${themeConfig.border} ${themeConfig.glow} transition-all duration-400 hover:scale-[1.04] hover:${themeConfig.glow} group`}
    >
      {/* Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${themeConfig.gradient} ${isDark ? "opacity-100" : "opacity-50"}`}
      />
      <div
        className={`absolute inset-0 ${isDark ? "bg-[#020617]/70" : "bg-white/70"} backdrop-blur-sm`}
      />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-14 h-14 rounded-xl ${themeConfig.badge} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon size={28} className="text-white" />
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${isDark ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-600"}`}
          >
            {t("Level")} {levelNumber}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-xl font-black uppercase tracking-tight mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={`text-xs leading-relaxed mb-4 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {description}
        </p>

        {/* Score Range */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-semibold ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {minScore} — {maxScore} {t("pts")}
          </span>
          <span
            className={`text-xs font-bold ${themeConfig.iconColor} group-hover:translate-x-1 transition-transform duration-300`}
          >
            {t("Explore")} →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
