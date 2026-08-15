"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface LoadingPlayerProps {
  isDark: boolean;
  text: string;
}

export default function LoadingPlayer({ isDark, text }: LoadingPlayerProps) {
  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
        isDark ? "bg-[#030712]" : "bg-slate-50"
      }`}
    >
      <div className="absolute w-[500px] h-[500px] rounded-full bg-amber-400/10 blur-[120px]" />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.85,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative w-20 h-20">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500"
          />

          <div className="absolute inset-3 rounded-full bg-amber-400/10 flex items-center justify-center">
            <Star size={22} className="text-amber-400" />
          </div>
        </div>

        <p
          className={`mt-5 text-sm font-semibold ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {text}
        </p>
      </motion.div>
    </div>
  );
}
