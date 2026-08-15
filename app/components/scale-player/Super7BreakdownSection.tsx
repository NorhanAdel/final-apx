"use client";

import { motion } from "framer-motion";
import {
  Crown,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Scale,
} from "lucide-react";
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

  const alignment = scoreData.alignmentScore;

  const getStatusBadge = () => {
    if (!alignment) return null;

    switch (alignment.status) {
      case "GOLD_VERIFIED":
        return {
          icon: ShieldCheck,
          bgColor: "bg-emerald-500/10 border-emerald-500/30",
          textColor: "text-emerald-500 dark:text-emerald-400",
          badgeBg: "bg-emerald-500 text-slate-950",
        };
      case "STANDARD":
        return {
          icon: CheckCircle,
          bgColor: "bg-blue-500/10 border-blue-500/30",
          textColor: "text-blue-500 dark:text-blue-400",
          badgeBg: "bg-blue-500 text-white",
        };
      case "FLAGGED":
        return {
          icon: AlertTriangle,
          bgColor: "bg-amber-500/10 border-amber-500/30",
          textColor: "text-amber-500 dark:text-amber-400",
          badgeBg: "bg-amber-500 text-slate-950",
        };
      case "CREDIBILITY_ALERT":
      default:
        return {
          icon: AlertOctagon,
          bgColor: "bg-red-500/10 border-red-500/30",
          textColor: "text-red-500 dark:text-red-400",
          badgeBg: "bg-red-500 text-white",
        };
    }
  };

  const statusConfig = getStatusBadge();
  const StatusIcon = statusConfig?.icon || Scale;

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

          {/* Breakdown & Alignment */}
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {breakdownItems.map((item, index) => (
                <BreakdownCard
                  key={item.name}
                  item={item}
                  index={index}
                  isDark={isDark}
                />
              ))}
            </div>

            {/* PHASE 6: SUPER7 ALIGNMENT SCORE (DATA GOVERNANCE LAYER) */}
            {alignment && (
              <div
                className={`p-5 rounded-2xl border ${statusConfig?.bgColor} backdrop-blur-xl relative overflow-hidden transition-all duration-300`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                      <Scale size={20} className="text-amber-500" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-500">
                          {t("DATA GOVERNANCE LAYER")}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-black ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {t("Super7 Alignment Score™")}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-500">
                        {alignment.score}%
                      </span>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">
                        {t("ALIGNMENT SCORE")}
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md ${statusConfig?.badgeBg}`}
                    >
                      <StatusIcon size={14} />
                      <span>{t(alignment.label)}</span>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-xs font-medium leading-relaxed mb-3 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {t(alignment.description)}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-500/20 text-center text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">
                      {t("Self Rating (Self)")}
                    </span>
                    <span className="font-black text-blue-400">
                      {alignment.selfRatingPercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">
                      {t("Objective Consensus (OCS)")}
                    </span>
                    <span className="font-black text-emerald-400">
                      {alignment.objectiveConsensusScore}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">
                      {t("Alignment Gap (Gap)")}
                    </span>
                    <span className="font-black text-amber-400">
                      {alignment.gap}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    </motion.section>
  );
}