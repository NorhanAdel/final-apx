"use client";

import { motion } from "framer-motion";
import { Video, Sparkles } from "lucide-react";
import useTranslate from "@/app/hooks/useTranslate";
import SevenSkillsRadar from "@/app/components/SevenSkillsRadar";
import SkillCard from "./SkillCard";
import { Skill } from "./types";

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

interface SkillsRadarSectionProps {
  skills: Skill[];
  isDark: boolean;
}

export default function SkillsRadarSection({
  skills,
  isDark,
}: SkillsRadarSectionProps) {
  const { t } = useTranslate();

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
      className="grid xl:grid-cols-[0.85fr_1.15fr] gap-6 mb-6"
    >
      {/* Radar */}
      <div
        className={`relative overflow-hidden rounded-[28px] border p-6 lg:p-8 ${
          isDark
            ? "bg-[#07101F]/90 border-white/[0.07]"
            : "bg-white border-slate-200"
        } shadow-xl`}
      >
        <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/10 blur-[90px] rounded-full" />

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Video size={15} className="text-emerald-400" />
                </div>

                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-400">
                  {t("AI ANALYSIS")}
                </span>
              </div>

              <h2
                className={`text-xl font-black ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {t("Player Skills")}
              </h2>

              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {t("Compared to all players")}
              </p>
            </div>

            <Sparkles size={18} className="text-amber-400" />
          </div>

          <div className="flex justify-center py-4">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.8,
                type: "spring",
              }}
            >
              <SevenSkillsRadar skills={skills} size={350} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div
        className={`relative overflow-hidden rounded-[28px] border p-6 lg:p-8 ${
          isDark
            ? "bg-[#07101F]/90 border-white/[0.07]"
            : "bg-white border-slate-200"
        } shadow-xl`}
      >
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/5 blur-[90px] rounded-full" />

        <div className="relative">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-black mb-2">
                {t("07 DIMENSIONS")}
              </p>

              <h2
                className={`text-xl font-black ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {t("Skill Breakdown")}
              </h2>
            </div>

            <div
              className={`hidden sm:flex items-center gap-2 text-[10px] font-bold ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {t("LIVE ANALYTICS")}
            </div>
          </div>

          <motion.div
            variants={staggerContainer}
            className="grid sm:grid-cols-2 gap-3"
          >
            {skills.map((skill, index) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                index={index}
                isDark={isDark}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}