"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Crown,
  Gauge,
  BarChart3,
  MapPin,
  Calendar,
  Eye,
  Star,
  TrendingUp,
  Users,
  ChevronRight,
} from "lucide-react";
import useTranslate from "@/app/hooks/useTranslate";
import GlassStat from "./GlassStat";
import { PlayerData } from "./types";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

interface PlayerHeaderSectionProps {
  player: PlayerData;
  avgRating: number;
  totalPercentage: number;
  totalRatings: number;
  isDark: boolean;
  isRTL: boolean;
  shouldReduceMotion: boolean | null;
  onExploreClick: () => void;
}

export default function PlayerHeaderSection({
  player,
  avgRating,
  totalPercentage,
  totalRatings,
  isDark,
  isRTL,
  shouldReduceMotion,
  onExploreClick,
}: PlayerHeaderSectionProps) {
  const { t } = useTranslate();

  const playerImage = player.profileImageUrl
    ? player.profileImageUrl.startsWith("http")
      ? player.profileImageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${player.profileImageUrl}`
    : "/b2.jpg";

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      transition={{ duration: 0.7 }}
      className="relative mb-8"
    >
      <div
        className={`relative min-h-[590px] lg:min-h-[620px] overflow-hidden rounded-[32px] border ${
          isDark
            ? "border-white/[0.08] bg-[#07101F]"
            : "border-slate-200 bg-white"
        } shadow-2xl`}
      >
        {/* Image */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <Image
            src={playerImage}
            alt={player.fullName || player.name}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 1450px"
          />
        </motion.div>

        {/* Image darkening */}
        <div
          className={`absolute inset-0 ${
            isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"
          } ${
            isDark
              ? "from-[#020617]/95 via-[#020617]/70 to-[#020617]/20"
              : "from-white/95 via-white/60 to-white/20"
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />

        {/* Decorative line */}
        <div
          className={`absolute top-0 ${
            isRTL ? "right-0" : "left-0"
          } w-1 h-full bg-gradient-to-b from-amber-300 via-amber-500 to-transparent`}
        />

        {/* Level badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="absolute top-6 left-6 z-20"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20">
            <Crown size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {player.levelTitle}
            </span>
          </div>
        </motion.div>

        {/* Score badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, type: "spring" }}
          className="absolute top-6 right-6 z-20"
        >
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border ${
              isDark
                ? "bg-black/40 border-white/10"
                : "bg-white/70 border-white"
            }`}
          >
            <Gauge size={14} className="text-amber-400" />
            <span className="text-xs font-black text-amber-400">
              S7 {player.super7Score}
            </span>
          </div>
        </motion.div>

        {/* Hero content */}
        <div
          className={`relative z-10 min-h-[590px] lg:min-h-[620px] flex items-end ${
            isRTL ? "justify-start" : "justify-start"
          }`}
        >
          <div className="w-full p-6 sm:p-8 lg:p-12">
            <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-end">
              {/* Player info */}
              <div className="max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-px bg-amber-400" />
                    <span className="text-[10px] uppercase tracking-[0.35em] font-black text-amber-400">
                      {t("PLAYER SCOUTING PROFILE")}
                    </span>
                  </div>

                  <h1
                    className={`text-4xl sm:text-5xl lg:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-7 ${
                      isDark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {player.fullName || player.name}
                  </h1>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {player.position && (
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-xl ${
                          isDark
                            ? "bg-white/[0.07] text-slate-200 border border-white/10"
                            : "bg-white/70 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <BarChart3 size={14} className="text-amber-500" />
                        {player.position}
                      </span>
                    )}

                    {player.nationality && (
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-xl ${
                          isDark
                            ? "bg-white/[0.07] text-slate-200 border border-white/10"
                            : "bg-white/70 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <MapPin size={14} className="text-amber-500" />
                        {player.nationality}
                        {player.country && player.country !== player.nationality
                          ? ` · ${player.country}`
                          : ""}
                      </span>
                    )}

                    {player.age !== undefined && player.age > 0 && (
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-xl ${
                          isDark
                            ? "bg-white/[0.07] text-slate-200 border border-white/10"
                            : "bg-white/70 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <Calendar size={14} className="text-amber-500" />
                        {player.age} {t("years old")}
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-xl ${
                        isDark
                          ? "bg-white/[0.07] text-slate-200 border border-white/10"
                          : "bg-white/70 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <Eye size={14} className="text-amber-500" />
                      {player.viewsCount || 0}
                    </span>
                  </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl"
                >
                  <GlassStat
                    icon={Star}
                    label={t("Rating")}
                    value={`${avgRating.toFixed(1)} / 7`}
                    isDark={isDark}
                  />

                  <GlassStat
                    icon={TrendingUp}
                    label={t("Performance")}
                    value={`${totalPercentage}%`}
                    isDark={isDark}
                  />

                  <GlassStat
                    icon={Users}
                    label={t("Ratings")}
                    value={totalRatings}
                    isDark={isDark}
                  />

                  <GlassStat
                    icon={Eye}
                    label={t("Views")}
                    value={player.viewsCount || 0}
                    isDark={isDark}
                  />
                </motion.div>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex lg:flex-col items-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onExploreClick}
                  className="group relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-2xl shadow-amber-500/30 flex items-center justify-center overflow-hidden"
                >
                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : { rotate: 360 }
                    }
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-2 rounded-full border border-white/30 border-dashed"
                  />

                  <div className="relative z-10 text-center">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-950/60 mb-1">
                      {t("EXPLORE")}
                    </span>

                    <span className="block text-sm font-black text-slate-950">
                      {t("View Full Profile")}
                    </span>

                    <ChevronRight
                      size={18}
                      className={`mx-auto mt-1 text-slate-950 transition-transform duration-300 ${
                        isRTL
                          ? "rotate-180 group-hover:-translate-x-1"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                  </div>

                  <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}