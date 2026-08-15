"use client";

import { motion } from "framer-motion";
import { BreakdownItem } from "./types";

interface BreakdownCardProps {
  item: BreakdownItem;
  index: number;
  isDark: boolean;
}

export default function BreakdownCard({
  item,
  index,
  isDark,
}: BreakdownCardProps) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.4,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
      }}
      whileHover={{
        y: -4,
        scale: 1.015,
      }}
      className={`group relative overflow-hidden rounded-2xl border p-4 ${
        isDark
          ? "bg-white/[0.025] border-white/[0.07] hover:bg-white/[0.045]"
          : "bg-white/75 border-gray-200 hover:bg-white"
      } backdrop-blur-xl`}
    >
      <div
        className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity"
        style={{
          backgroundColor: item.color,
        }}
      />

      <div className="relative flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: item.bgColor,
            color: item.color,
          }}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] font-bold uppercase tracking-wide truncate ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {item.name}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xl font-black"
              style={{
                color: item.color,
              }}
            >
              {Math.round(item.value)}%
            </span>

            <div
              className={`h-1.5 flex-1 rounded-full overflow-hidden ${
                isDark ? "bg-black/40" : "bg-slate-100"
              }`}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${item.value}%`,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.9,
                  delay: index * 0.06,
                }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
