"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SevenSkillsRadar from "./SevenSkillsRadar";

interface PlayerRatingSectionProps {
  skills: Array<{
    name: string;
    value: number;
    icon: any;
    color: string;
  }>;
  avgRating: number;
  totalReviews: number;
  ratingStatus: string;
  ratingStatusColor: string;
  isDark: boolean;
  t: (key: string) => string;
  player: {
    fullName?: string;
    name?: string;
    profileImageUrl?: string;
    levelTitle?: string;
    position?: string;
  };
}

export default function PlayerRatingSection({
  skills,
  avgRating,
  totalReviews,
  ratingStatus,
  ratingStatusColor,
  isDark,
  t,
  player,
}: PlayerRatingSectionProps) {
  const playerImage = player?.profileImageUrl
    ? player.profileImageUrl.startsWith("http")
      ? player.profileImageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${player.profileImageUrl}`
    : "/b2.jpg";

  const totalPercentage = Math.round((avgRating / 7) * 100);

  return (
    <div
      className={`rounded-3xl border p-6 md:p-10 ${
        isDark ? "border-white/10 bg-[#030712]" : "border-gray-200 bg-white"
      } shadow-2xl`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-yellow-400 tracking-wide uppercase">
            {t("PLAYER RATING")}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {t("Compared to all players")} ({totalReviews} {t("reviews")})
          </p>
        </div>
        <span
          className={`text-xs font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider ${ratingStatusColor} ${
            isDark ? "bg-white/5 border border-white/10" : "bg-gray-100"
          }`}
        >
          {ratingStatus}
        </span>
      </div>

      <div className="flex flex-col items-center gap-8">
        {/* Top Section: Player Info Card with more spacing from the Radar Chart */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-40 w-full max-w-4xl p-6 rounded-3xl bg-black/20 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent pointer-events-none" />

          {/* Player Image, Line, Name & Overall Score */}
          <div className="flex flex-col items-center text-center flex-shrink-0">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-yellow-400/40 shadow-lg mb-2">
              <Image
                src={playerImage}
                alt={player?.fullName || player?.name || "Player"}
                fill
                className="object-cover object-top"
              />
            </div>
            {/* خط تحت الصورة */}
            <div className="w-16 h-0.5 bg-yellow-400/60 mb-2 rounded-full" />
            
            <h3 className={`text-sm font-black uppercase tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              {player?.fullName || player?.name}
            </h3>
            {player?.position && (
              <span className="text-[11px] font-semibold text-yellow-500 mt-0.5">
                {player.position}
              </span>
            )}

            <div className="mt-2.5 flex flex-col items-center gap-0.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-[8px] text-gray-400 uppercase tracking-wider font-medium">Overall Score</span>
              <span className="text-base font-black text-yellow-400">
                {Math.round(avgRating * 10) / 10} <span className="text-[10px] text-gray-400 font-normal">/ 7</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400">
                {totalPercentage}%
              </span>
            </div>
          </div>

          {/* Radar Chart - with more spacing */}
          <div className="flex items-center justify-center relative">
            <div className="p-2">
              <SevenSkillsRadar skills={skills} size={320} />
            </div>
          </div>
        </div>

        {/* Skill Bars */}
        <div className="w-full max-w-3xl flex flex-col gap-2.5 mt-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className={`flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.05]"
                  : "bg-gray-50 border-gray-100 hover:border-gray-200"
              }`}
            >
              {/* Skill Name & Icon */}
              <div className="flex items-center gap-3 min-w-[160px] sm:min-w-[180px]">
                <div
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${skill.color}15`, color: skill.color }}
                >
                  <skill.icon size={15} />
                </div>
                <span className={`text-xs sm:text-sm font-bold truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {skill.name}
                </span>
              </div>

              {/* Bar and Percentage Side */}
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className={`flex-1 h-2.5 rounded-full overflow-hidden p-0.5 ${isDark ? "bg-black/50" : "bg-gray-200"}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.06, ease: "easeOut" }}
                    className="h-full rounded-full relative"
                    style={{
                      background: `linear-gradient(90deg, ${skill.color}, ${skill.color}aa)`,
                      boxShadow: `0 0 8px ${skill.color}55`,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-md min-w-[42px] text-center flex-shrink-0"
                  style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                >
                  {Math.round(skill.value)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}