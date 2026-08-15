"use client";

import { ElementType } from "react";
import { motion } from "framer-motion";

interface GlassStatProps {
  icon: ElementType;
  label: string;
  value: string | number;
  isDark: boolean;
}

export default function GlassStat({
  icon: Icon,
  label,
  value,
  isDark,
}: GlassStatProps) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.015,
      }}
      transition={{
        duration: 0.2,
      }}
      className={`group relative overflow-hidden rounded-2xl border p-4 ${
        isDark
          ? "bg-white/[0.035] border-white/[0.07] hover:border-amber-400/30"
          : "bg-white/70 border-gray-200 hover:border-amber-300"
      } backdrop-blur-xl transition-colors`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDark ? "bg-amber-400/10" : "bg-amber-50"
          }`}
        >
          <Icon size={18} className="text-amber-500" />
        </div>

        <div className="min-w-0">
          <p
            className={`text-[10px] uppercase tracking-wider font-bold ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`text-sm font-black truncate ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
