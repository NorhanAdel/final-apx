"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";

interface CircularScoreGaugeProps {
  score: number;
  maxScore?: number;
  percentage?: number;
  size?: number;
}

export default function CircularScoreGauge({
  score,
  maxScore = 100,
  percentage,
  size = 240,
}: CircularScoreGaugeProps) {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";
  const shouldReduceMotion = useReducedMotion();

  const [showPercentage, setShowPercentage] = useState(false);
  const [fading, setFading] = useState(false);

  const safeScore = Math.max(0, Math.min(score, maxScore));
  const progress = safeScore / maxScore;

  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;

  const displayPercentage =
    percentage !== undefined
      ? Math.round(percentage)
      : Math.round(progress * 100);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setFading(true);

      setTimeout(() => {
        setShowPercentage((prev) => !prev);
        setFading(false);
      }, 250);
    }, 3500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const toggleValue = () => {
    setFading(true);

    setTimeout(() => {
      setShowPercentage((prev) => !prev);
      setFading(false);
    }, 250);
  };

  return (
    <motion.button
      type="button"
      onClick={toggleValue}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.035 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      className="relative group cursor-pointer focus:outline-none"
      style={{ width: size, height: size }}
      aria-label="Toggle score display"
    >
      {/* Ambient glow */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: [0.18, 0.28, 0.18],
              }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[10%] rounded-full bg-amber-400/20 blur-3xl"
      />

      {/* Outer ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10 -rotate-90"
      >
        <defs>
          <linearGradient
            id="super7-gauge-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#FBBF24" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <filter id="super7-gauge-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDark ? "#172033" : "#E5E7EB"}
          strokeWidth="10"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#super7-gauge-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: circumference,
          }}
          whileInView={{
            strokeDashoffset: circumference * (1 - progress),
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 1.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          filter="url(#super7-gauge-glow)"
        />

        {/* Tick marks */}
        {[...Array(24)].map((_, index) => {
          const angle = (360 / 24) * index;
          const isMajor = index % 3 === 0;

          return (
            <line
              key={index}
              x1={size / 2}
              y1={16}
              x2={size / 2}
              y2={isMajor ? 22 : 19}
              stroke={isDark ? "#475569" : "#CBD5E1"}
              strokeWidth={isMajor ? 2 : 1}
              opacity={isMajor ? 0.7 : 0.4}
              transform={`rotate(${angle} ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>

      {/* Inner glass */}
      <div
        className={`absolute inset-[18%] rounded-full backdrop-blur-xl border flex flex-col items-center justify-center z-20 ${
          isDark
            ? "bg-slate-950/80 border-white/10"
            : "bg-white/85 border-gray-200"
        }`}
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${
            isDark
              ? "from-amber-400/[0.07] to-transparent"
              : "from-amber-300/[0.12] to-transparent"
          }`}
        />

        <div
          className={`relative flex flex-col items-center transition-all duration-300 ${
            fading ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-1">
            {t("SUPER7")}
          </span>

          {showPercentage ? (
            <>
              <span className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                {displayPercentage}%
              </span>

              <span className="text-[10px] text-slate-400 mt-1">
                {safeScore.toFixed(1)} / {maxScore}
              </span>
            </>
          ) : (
            <>
              <span className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                {safeScore.toFixed(1)}
              </span>

              <span className="text-[10px] text-emerald-400 font-bold mt-1">
                {displayPercentage}% {t("PERFORMANCE")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Top sparkle */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                rotate: [0, 15, -10, 0],
                scale: [1, 1.15, 1],
              }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
        className="absolute -top-1 -right-1 z-30"
      >
        <Sparkles size={22} className="text-yellow-400" />
      </motion.div>
    </motion.button>
  );
}
