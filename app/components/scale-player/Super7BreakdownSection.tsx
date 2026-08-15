"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import useTranslate from "@/app/hooks/useTranslate";
import CircularScoreGauge from "./CircularScoreGauge";
import BreakdownCard from "./BreakdownCard";
import { Super7Score, BreakdownItem } from "./types";

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

interface Super7BreakdownSectionProps {
  scoreData: Super7Score;
  breakdownItems: BreakdownItem[];
  isDark: boolean;
}

export default function Super7BreakdownSection({
  scoreData,
  breakdownItems,
  isDark,
}: Super7BreakdownSectionProps) {
  const { t } = useTranslate();

  if (!scoreData || breakdownItems.length === 0) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.08,
      }}
      variants={fadeUp}
      transition={{ duration: 0.7 }}
      className={`relative overflow-hidden rounded-[32px] border ${
        isDark
          ? "bg-[#060D18] border-white/[0.08]"
          : "bg-white border-slate-200"
      } shadow-2xl`}
    >
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-400/[0.06] blur-[120px] rounded-full" />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col xl:flex-row gap-10">
          {/* Score */}
          <div className="xl:w-[320px] flex-shrink-0 flex flex-col items-center justify-center">
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                <Crown size={13} className="text-amber-400" />

                <span className="text-[9px] uppercase tracking-[0.2em] font-black text-amber-400">
                  {t("ELITE INDEX")}
                </span>
              </div>
            </div>

            <CircularScoreGauge
              score={scoreData.total}
              maxScore={100}
              percentage={scoreData.total}
              size={250}
            />

            <div className="text-center mt-4">
              <p
                className={`text-xs uppercase tracking-[0.25em] font-black ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {t("Super7 Score")}
              </p>

              <p className="text-sm font-black text-amber-500 mt-1">
                {scoreData.level}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-black mb-2">
                  {t("PERFORMANCE MATRIX")}
                </p>

                <h2
                  className={`text-2xl font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {t("Super7 Score Breakdown")}
                </h2>
              </div>

              <div
                className={`flex items-center gap-2 text-[10px] font-bold ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t("AI POWERED")}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {breakdownItems.map((item, index) => (
                <BreakdownCard
                  key={item.name}
                  item={item}
                  index={index}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    </motion.section>
  );
}