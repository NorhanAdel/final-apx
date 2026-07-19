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
  const [averageRatings, setAverageRatings] = useState<AverageRatings | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAverageRatings = async () => {
      if (!playerId) return;
      setLoading(true);
      try {
        const result = await fetchGraphQL<{
          playerAverageRatings: AverageRatings;
        }>(GET_PLAYER_AVERAGE_RATINGS, { playerId });
        if (result.data?.playerAverageRatings) {
          setAverageRatings(result.data.playerAverageRatings);
        }
      } catch (error) {
        console.error("Error fetching average ratings:", error);
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

  // Calculate percentile (mock for now - you can replace with actual data)
  const percentile = 35; // This should come from your API
  const ratingStatus =
    avgRating < 3
      ? t("BELOW AVERAGE")
      : avgRating < 5
      ? t("AVERAGE")
      : t("ABOVE AVERAGE");
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
        {
          name: t("Scalability"),
          value: averageRatings.scalabilityPercent || 0,
          icon: TrendingUp,
          color: "#3B82F6",
        },
        {
          name: t("Mental Stability"),
          value: averageRatings.mentalStabilityPercent || 0,
          icon: Brain,
          color: "#8B5CF6",
        },
        {
          name: t("Soccer Intelligence"),
          value: averageRatings.soccerIntelligencePercent || 0,
          icon: Eye,
          color: "#6366F1",
        },
        {
          name: t("Physical Fitness"),
          value: averageRatings.physicalFitnessPercent || 0,
          icon: Activity,
          color: "#10B981",
        },
        {
          name: t("Technical Skill"),
          value: averageRatings.technicalSkillPercent || 0,
          icon: Target,
          color: "#F59E0B",
        },
        {
          name: t("Tactical Vision"),
          value: averageRatings.tacticalVisionPercent || 0,
          icon: Shield,
          color: "#EF4444",
        },
        {
          name: t("Republican Influence"),
          value: averageRatings.republicanInfluencePercent || 0,
          icon: Award,
          color: "#EAB308",
        },
      ]
    : [];

  if (loading) {
    return (
      <div dir="ltr" className="text-left mt-8">
        <div className="flex justify-center items-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star size={16} className="text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>
        <p className={`text-center ${secondaryTextColor} font-medium`}>
          {t("Loading ratings...")}
        </p>
      </div>
    );
  }

  return (
    <div dir="ltr" className="text-left mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">
            {t("PLAYER RATING")}
          </h2>
          <p className={`text-sm ${secondaryTextColor} mt-1`}>
            {t("Compared to all players")}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${ratingColor} bg-opacity-10`}
          style={{ backgroundColor: `${ratingColor.replace("text-", "")}20` }}
        >
          {ratingStatus}
        </div>
      </div>

      {/* Main Content - Left Circle + Right Skills */}
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Left Side - Circle Rating - MUCH LARGER */}
        <div className="lg:w-2/5 flex flex-col items-center justify-center">
          {/* Circular Progress - Enlarged */}
          <div className="relative w-72 h-72 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer circle shadow */}
              <circle
                cx="144"
                cy="144"
                r="132"
                stroke={isDark ? "#1f2937" : "#e5e7eb"}
                strokeWidth="16"
                fill="none"
                className="transition-all duration-300"
              />
              {/* Progress circle */}
              <circle
                cx="144"
                cy="144"
                r="132"
                stroke="url(#gradient)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 132}`}
                strokeDashoffset={`${2 * Math.PI * 132 * (1 - avgRating / 7)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Inner circle glow effect */}
              <circle
                cx="144"
                cy="144"
                r="124"
                fill={isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)"}
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>

            {/* Content inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Large rating number */}
              <span className="text-7xl font-black bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {avgRating.toFixed(1)}
              </span>

              {/* Stars row - larger stars */}
              <div className="flex items-center gap-1.5 mt-3 px-0 sm:px-3">
                {[1, 2, 3, 4, 5, 6, 7].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={`${
                      star <= Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Reviews count */}
              <p className={`text-sm ${secondaryTextColor} mt-3`}>
                {total} {t("reviews")}
              </p>
            </div>
          </div>

          {/* Percentile info */}
          <div className="text-center mt-2">
            <p className={`text-base ${secondaryTextColor}`}>
              {percentile}
              {t("th Percentile")}
            </p>
          </div>
        </div>

        {/* Right Side - Skills Breakdown - Adjusted width */}
        <div className="lg:w-3/5 w-full px-0 sm:px-4">
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div style={{ color: skill.color }}>
                      <skill.icon size={16} />
                    </div>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {skill.name}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${textColor}`}>
                    {Math.round(skill.value)}%
                  </span>
                </div>

                {/* تم إزالة الـ padding في الشاشات الصغيرة */}
                <div className="px-0 sm:px-2">
                  <div
                    className={`h-2.5 rounded-full overflow-hidden ${
                      isDark ? "bg-gray-800" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${skill.value}%`,
                        background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}