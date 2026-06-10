"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";

interface CircularScoreGaugeProps {
  score: number;
  maxScore?: number;
  percentage?: number;
  size?: number;
  label?: string;
}

export default function CircularScoreGauge({
  score,
  maxScore = 7,
  percentage,
  size = 260,
  label,
}: CircularScoreGaugeProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showPercentage, setShowPercentage] = useState(false);
  const [fading, setFading] = useState(false);

  const radius = (size - 32) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score / maxScore;
  const displayPercentage =
    percentage !== undefined ? percentage : Math.round(progress * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // Auto-switch between score and percentage every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setShowPercentage((prev) => !prev);
        setFading(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    setFading(true);
    setTimeout(() => {
      setShowPercentage((prev) => !prev);
      setFading(false);
    }, 300);
  };

  const strokeDashoffset = circumference * (1 - animatedProgress);
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
        onClick={handleClick}
      >
        <svg className="w-full h-full transform -rotate-90">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={isDark ? "#1f2937" : "#e5e7eb"}
            strokeWidth="14"
            fill="none"
            className="transition-all duration-300"
          />
          {/* Animated progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth="14"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-[1500ms] ease-out"
          />
          {/* Inner fill */}
          <circle
            cx={center}
            cy={center}
            r={radius - 10}
            fill={isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)"}
          />
          <defs>
            <linearGradient
              id="scoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content — switches between score and percentage */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
        >
          {showPercentage ? (
            <>
              <span className="text-6xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                {displayPercentage}%
              </span>
              <span
                className={`text-sm mt-1 font-semibold text-yellow-500`}
              >
                {score.toFixed(1)} / {maxScore}
              </span>
            </>
          ) : (
            <>
              <span className="text-6xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                {score.toFixed(1)}
              </span>
              <span
                className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                / {maxScore}
              </span>
              <span className="text-sm font-semibold text-yellow-500 mt-0.5">
                {displayPercentage}%
              </span>
            </>
          )}
        </div>
      </div>

      {label && (
        <p
          className={`text-sm mt-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {label}
        </p>
      )}
    </div>
  );
}

