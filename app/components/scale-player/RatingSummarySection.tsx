"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import useTranslate from "@/app/hooks/useTranslate";

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

interface RatingSummarySectionProps {
  avgRating: number;
  totalPercentage: number;
  ratingStatus: string;
  ratingStatusColor: string;
  isDark: boolean;
}

export default function RatingSummarySection({
  avgRating,
  totalPercentage,
  ratingStatus,
  ratingStatusColor,
  isDark,
}: RatingSummarySectionProps) {
  const { t } = useTranslate();

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.2,
      }}
      variants={fadeUp}
      transition={{ duration: 0.7 }}
      className={`relative overflow-hidden rounded-[28px] border mb-6 ${
        isDark
          ? "bg-gradient-to-br from-[#0B1424] to-[#050B14] border-white/[0.07]"
          : "bg-white border-slate-200"
      } shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full" />

      <div className="relative p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
                <Star size={16} className="text-amber-400 fill-amber-400" />
              </div>

              <span className="text-[10px] uppercase tracking-[0.25em] font-black text-amber-500">
                {t("PLAYER RATING")}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <h2
                className={`text-2xl font-black ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {avgRating.toFixed(1)}
                <span className="text-sm text-slate-400 font-bold"> / 7</span>
              </h2>

              <span className={`text-sm font-bold ${ratingStatusColor}`}>
                {ratingStatus}
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {t("Overall performance")}
              </span>

              <span className="text-xs font-black text-amber-500">
                {totalPercentage}%
              </span>
            </div>

            <div
              className={`h-3 rounded-full overflow-hidden ${
                isDark ? "bg-black/40" : "bg-slate-100"
              }`}
            >
              <motion.div
                initial={{
                  width: 0,
                }}
                whileInView={{
                  width: `${totalPercentage}%`,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 1.2,
                }}
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 shadow-lg shadow-amber-500/20"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}