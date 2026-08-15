"use client";

import { motion } from "framer-motion";
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

interface SkillCardProps {
  skill: Skill;
  index: number;
  isDark: boolean;
}

export default function SkillCard({ skill, index, isDark }: SkillCardProps) {
  const Icon = skill.icon;

  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.7 }}
      whileHover={{
        y: -5,
        scale: 1.015,
      }}
      className={`group relative overflow-hidden rounded-2xl border p-4 ${
        isDark
          ? "bg-slate-900/50 border-white/[0.06] hover:border-white/[0.13]"
          : "bg-white/80 border-slate-200 hover:border-slate-300"
      } backdrop-blur-xl`}
    >
      {/* Hover light */}
      <div
        className="absolute -right-10 -top-10 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{
          backgroundColor: skill.color,
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                color: skill.color,
                backgroundColor: `${skill.color}15`,
                border: `1px solid ${skill.color}25`,
              }}
            >
              <Icon size={16} />
            </div>

            <span
              className={`text-xs font-bold truncate ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              {skill.name}
            </span>
          </div>

          <motion.span
            whileHover={{ scale: 1.08 }}
            className="text-xs font-black px-2 py-1 rounded-lg flex-shrink-0"
            style={{
              color: skill.color,
              backgroundColor: `${skill.color}12`,
            }}
          >
            {Math.round(skill.value)}%
          </motion.span>
        </div>

        <div
          className={`h-2 rounded-full overflow-hidden ${
            isDark ? "bg-black/40" : "bg-slate-100"
          }`}
        >
          <motion.div
            initial={{
              width: 0,
            }}
            whileInView={{
              width: `${skill.value}%`,
            }}
            viewport={{
              once: true,
              amount: 0.7,
            }}
            transition={{
              duration: 1.1,
              delay: index * 0.08,
            }}
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: `linear-gradient(90deg, ${skill.color}, ${skill.color}99)`,
              boxShadow: `0 0 14px ${skill.color}55`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
