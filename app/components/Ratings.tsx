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
import CircularScoreGauge from "./CircularScoreGauge";

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
  averagePercentage?: number;
  percentile?: number;
  technicalSkillPercent: number;
  physicalFitnessPercent: number;
  gameIntelligencePercent: number;
  mentalResiliencePercent: number;
  professionalismPercent: number;
  growthPotentialPercent: number;
  marketReadinessPercent: number;
  totalRatings: number;
}

export default function Ratings({ ratings = [], playerId }: RatingsProps) {
  const { t, lang } = useTranslate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";
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
        console.log("📊 Average Ratings Response:", result);
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

  const percentile = averageRatings?.percentile ?? 0;
  const averagePercentage =
    averageRatings?.averagePercentage || Math.round((avgRating / 7) * 100);

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
          name: t("Technical Skill"),
          value: averageRatings.technicalSkillPercent || 0,
          icon: Target,
          color: "#F59E0B",
        },
        {
          name: t("Physical Fitness"),
          value: averageRatings.physicalFitnessPercent || 0,
          icon: Activity,
          color: "#10B981",
        },
        {
          name: t("Soccer Intelligence"),
          value: averageRatings.gameIntelligencePercent || 0,
          icon: Eye,
          color: "#6366F1",
        },
        {
          name: t("Mental Stability"),
          value: averageRatings.mentalResiliencePercent || 0,
          icon: Brain,
          color: "#8B5CF6",
        },
        {
          name: t("Professionalism"),
          value: averageRatings.professionalismPercent || 0,
          icon: Award,
          color: "#EAB308",
        },
        {
          name: t("Growth Potential"),
          value: averageRatings.growthPotentialPercent || 0,
          icon: TrendingUp,
          color: "#3B82F6",
        },
        {
          name: t("Market Readiness"),
          value: averageRatings.marketReadinessPercent || 0,
          icon: Shield,
          color: "#EF4444",
        },
      ]
    : [];

  if (loading) {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={isRTL ? "text-right mt-8" : "text-left mt-8"}
      >
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
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={isRTL ? "text-right mt-8" : "text-left mt-8"}
    >
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

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Circle Rating Side - using CircularScoreGauge */}
        <div className="lg:w-2/5 flex flex-col items-center justify-center">
          <CircularScoreGauge
            score={avgRating}
            maxScore={7}
            percentage={averagePercentage}
            size={280}
          />

          {/* Reviews count */}
          <p className={`text-sm ${secondaryTextColor} mt-2`}>
            {total} {t("reviews")}
          </p>

          {/* Percentile info - dynamic from API */}
          {percentile > 0 && (
            <div className="text-center mt-2">
              <p className={`text-base ${secondaryTextColor}`}>
                <span className="font-bold text-yellow-400">{percentile}</span>
                {t("th Percentile")}
              </p>
            </div>
          )}
        </div>

        {/* Skills Breakdown Side */}
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
