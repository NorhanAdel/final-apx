"use client";

import { useEffect, useState } from "react";
import {
  Star,
  TrendingUp,
  Brain,
  Activity,
  Target,
  Eye,
  Shield,
  Award,
} from "lucide-react";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_PLAYER_AVERAGE_RATINGS } from "@/app/graphql/query/rating.queries";
import { useTheme } from "@/app/context/ThemeContext";

interface Rating {
  id?: string | number;
  calculated_stars: number;
}

interface RatingsProps {
  ratings: Rating[];
  playerId?: string;
}

interface AverageRatings {
  averageStars: number;
  averagePercentage: number;
  scalabilityPercent: number;
  mentalStabilityPercent: number;
  soccerIntelligencePercent: number;
  physicalFitnessPercent: number;
  technicalSkillPercent: number;
  tacticalVisionPercent: number;
  republicanInfluencePercent: number;
  totalRatings: number;
}

export default function Ratings({ ratings = [], playerId }: RatingsProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [averageRatings, setAverageRatings] = useState<AverageRatings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAverageRatings = async () => {
      if (!playerId) return;
      setLoading(true);
      try {
        const result = await fetchGraphQL<{ playerAverageRatings: AverageRatings }>(
          GET_PLAYER_AVERAGE_RATINGS,
          { playerId }
        );
        if (result.data?.playerAverageRatings) {
          setAverageRatings(result.data.playerAverageRatings);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAverageRatings();
  }, [playerId]);

  const total = averageRatings?.totalRatings || ratings.length;

  const avgRating =
    averageRatings?.averageStars ||
    (total > 0
      ? ratings.reduce((sum, r) => sum + (r.calculated_stars || 0), 0) / total
      : 0);

  const averagePercentage =
    averageRatings?.averagePercentage || (avgRating / 7) * 100;

  const percentile = 35;

  const ratingStatus =
    avgRating < 3 ? "BELOW AVERAGE" : avgRating < 5 ? "AVERAGE" : "ABOVE AVERAGE";

  const ratingColor =
    avgRating < 3
      ? "text-red-500"
      : avgRating < 5
      ? "text-yellow-500"
      : "text-green-500";

  const textColor = isDark ? "text-gray-200" : "text-gray-800";
  const secondaryTextColor = isDark ? "text-gray-400" : "text-gray-600";

  const skills = averageRatings
    ? [
        { name: t("Scalability"), value: averageRatings.scalabilityPercent || 0, icon: TrendingUp, color: "#3B82F6" },
        { name: t("Mental Stability"), value: averageRatings.mentalStabilityPercent || 0, icon: Brain, color: "#8B5CF6" },
        { name: t("Soccer Intelligence"), value: averageRatings.soccerIntelligencePercent || 0, icon: Eye, color: "#6366F1" },
        { name: t("Physical Fitness"), value: averageRatings.physicalFitnessPercent || 0, icon: Activity, color: "#10B981" },
        { name: t("Technical Skill"), value: averageRatings.technicalSkillPercent || 0, icon: Target, color: "#F59E0B" },
        { name: t("Tactical Vision"), value: averageRatings.tacticalVisionPercent || 0, icon: Shield, color: "#EF4444" },
        { name: t("Republican Influence"), value: averageRatings.republicanInfluencePercent || 0, icon: Award, color: "#EAB308" },
      ]
    : [];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto" />
        <p className={`mt-4 text-sm ${secondaryTextColor}`}>
          {t("Loading ratings...")}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 px-3 sm:px-6 lg:px-0">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-400">
            {t("PLAYER RATING")}
          </h2>
          <p className={`text-xs sm:text-sm ${secondaryTextColor}`}>
            {t("Compared to all players")}
          </p>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${ratingColor} bg-opacity-10`}>
          {ratingStatus}
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-col lg:flex-row gap-8 items-center">

        {/* CIRCLE */}
        <div className="w-full lg:w-2/5 flex flex-col items-center">
          <div className="relative w-56 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72 mb-4">

            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke={isDark ? "#1f2937" : "#e5e7eb"} strokeWidth="12" fill="none" />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={`${283 * (1 - averagePercentage / 100)}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>

            {/* CENTER TEXT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs sm:text-sm text-gray-400">/ 7</span>
              <span className="text-xs text-yellow-400">
                {Math.round(averagePercentage)}%
              </span>
            </div>
          </div>

          <p className={`text-xs sm:text-sm ${secondaryTextColor}`}>
            {percentile} percentile
          </p>
        </div>

        {/* SKILLS */}
        <div className="w-full lg:w-3/5 space-y-4">

          {skills.map((skill, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <skill.icon size={14} style={{ color: skill.color }} />
                  <span className={`text-xs sm:text-sm ${textColor}`}>
                    {skill.name}
                  </span>
                </div>
                <span className="text-xs sm:text-sm">{Math.round(skill.value)}%</span>
              </div>

              <div className={`h-2 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${skill.value}%`,
                    backgroundColor: skill.color,
                  }}
                />
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}