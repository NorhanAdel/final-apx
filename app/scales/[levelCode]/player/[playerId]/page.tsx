"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Eye,
  Star,
  TrendingUp,
  Brain,
  Activity,
  Target,
  Shield,
  Award,
  Users,
  Heart,
  Zap,
  Crown,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import {
  GET_PLAYER_SUPER7_SCORE,
  GET_PLAYERS_BY_LEVEL,
} from "@/app/graphql/query/scale.queries";
import { GET_PLAYER_AVERAGE_RATINGS } from "@/app/graphql/query/rating.queries";
import SevenSkillsRadar from "@/app/components/SevenSkillsRadar";
import Super7Breakdown from "@/app/components/Super7Breakdown";

interface RatingsDetails {
  totalRatings: number;
  averageStars: number;
  averagePercentage: number;
  technicalSkillPercent: number;
  physicalFitnessPercent: number;
  gameIntelligencePercent: number;
  mentalResiliencePercent: number;
  professionalismPercent: number;
  growthPotentialPercent: number;
  marketReadinessPercent: number;
}

interface Super7Breakdown {
  playerSelfRating: number;
  adminRating: number;
  externalGroupRating: number;
  aiAnalysisScore: number;
  transferValue: number;
  favoriteCount: number;
  profileViews: number;
  idealHeight: number;
  idealWeight: number;
  bmiScore: number;
}

interface PlayerData {
  id: string;
  name: string;
  fullName: string;
  profileImageUrl?: string;
  nationality?: string;
  country?: string;
  age?: number;
  level: string;
  levelTitle: string;
  super7Score: number;
  super7Breakdown?: Super7Breakdown;
  viewsCount: number;
  position?: string;
  ratingsDetails?: RatingsDetails;
}

interface Super7Score {
  total: number;
  level: string;
  title: string;
  breakdown: Super7Breakdown;
}

export default function ScalePlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const levelCode = params.levelCode as string;
  const playerId = params.playerId as string;

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [scoreData, setScoreData] = useState<Super7Score | null>(null);
  const [averageRatings, setAverageRatings] = useState<RatingsDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      setLoading(true);
      try {
        const result = await fetchGraphQL<{
          playersByLevel: { data: PlayerData[] };
        }>(GET_PLAYERS_BY_LEVEL, {
          levelCode,
          limit: 100,
          skip: 0,
        });

        if (result.data?.playersByLevel?.data) {
          const found = result.data.playersByLevel.data.find(
            (p) => p.id === playerId,
          );
          if (found) {
            setPlayer(found);
            if (found.ratingsDetails) {
              setAverageRatings(found.ratingsDetails);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch player:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [levelCode, playerId]);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const result = await fetchGraphQL<{
          playerSuper7Score: Super7Score;
        }>(GET_PLAYER_SUPER7_SCORE, { playerId });
        if (result.data?.playerSuper7Score) {
          setScoreData(result.data.playerSuper7Score);
        }
      } catch (error) {
        console.error("Failed to fetch Super7 score:", error);
      }
    };

    if (playerId) fetchScore();
  }, [playerId]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (averageRatings) return;
      try {
        const result = await fetchGraphQL<{
          playerAverageRatings: RatingsDetails;
        }>(GET_PLAYER_AVERAGE_RATINGS, { playerId });
        if (result.data?.playerAverageRatings) {
          setAverageRatings(result.data.playerAverageRatings);
        }
      } catch (error) {
        console.error("Failed to fetch average ratings:", error);
      }
    };

    if (playerId) fetchRatings();
  }, [playerId, averageRatings]);

  const avgRating = averageRatings?.averageStars || 0;
  const totalPercentage = averageRatings?.averagePercentage
    ? Math.round(averageRatings.averagePercentage)
    : Math.round((avgRating / 7) * 100);

  const ratingStatus =
    avgRating < 3
      ? t("BELOW AVERAGE")
      : avgRating < 5
      ? t("AVERAGE")
      : t("ABOVE AVERAGE");
  const ratingStatusColor =
    avgRating < 3
      ? "text-red-500"
      : avgRating < 5
      ? "text-yellow-500"
      : "text-green-500";

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
          name: t("Game Intelligence"),
          value: averageRatings.gameIntelligencePercent || 0,
          icon: Brain,
          color: "#6366F1",
        },
        {
          name: t("Mental Resilience"),
          value: averageRatings.mentalResiliencePercent || 0,
          icon: Shield,
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
          icon: Eye,
          color: "#EF4444",
        },
      ]
    : [];

  const breakdownData = scoreData?.breakdown || player?.super7Breakdown;
  const breakdownSkills = breakdownData
    ? [
        { name: t("Player Self Rating"), value: Math.min(Math.round(((breakdownData.playerSelfRating || 0) / 7) * 100), 100), icon: Star, color: "#3B82F6" },
        { name: t("Admin Rating"), value: Math.min(Math.round(((breakdownData.adminRating || 0) / 7) * 100), 100), icon: Shield, color: "#8B5CF6" },
        { name: t("External Rating"), value: Math.min(Math.round(((breakdownData.externalGroupRating || 0) / 100) * 100), 100), icon: Users, color: "#06B6D4" },
        { name: t("AI Analysis"), value: Math.min(Math.round(breakdownData.aiAnalysisScore || 0), 100), icon: Brain, color: "#10B981" },
        { name: t("Transfer Value"), value: Math.min(Math.round(((breakdownData.transferValue || 0) / 100) * 100), 100), icon: Zap, color: "#EAB308" },
        { name: t("Favorites"), value: Math.min(Math.round(((breakdownData.favoriteCount || 0) / 50) * 100), 100), icon: Heart, color: "#EF4444" },
        { name: t("Profile Views"), value: Math.min(Math.round(((breakdownData.profileViews || 0) / 200) * 100), 100), icon: Eye, color: "#6366F1" },
        { name: t("Height"), value: Math.min(Math.round(((breakdownData.idealHeight || 0) / 200) * 100), 100), icon: TrendingUp, color: "#14B8A6" },
        { name: t("Weight"), value: Math.min(Math.round(((breakdownData.idealWeight || 0) / 100) * 100), 100), icon: Activity, color: "#F97316" },
        { name: t("BMI"), value: Math.min(Math.round(((breakdownData.bmiScore || 0) / 30) * 100), 100), icon: Target, color: "#EC4899" },
      ]
    : [];

  const playerImage = player?.profileImageUrl
    ? player.profileImageUrl.startsWith("http")
      ? player.profileImageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${player.profileImageUrl}`
    : "/b2.jpg";

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617]" : "bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Star size={20} className="text-yellow-400 animate-pulse" />
            </div>
          </div>
          <p
            className={`text-sm font-medium ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t("Loading player details...")}
          </p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${
          isDark ? "bg-[#020617]" : "bg-gray-50"
        }`}
      >
        <p className="text-red-500 text-lg font-medium">
          {t("Player not found")}
        </p>
        <button
          onClick={() => router.push(`/scales/${levelCode}`)}
          className="text-yellow-500 hover:underline text-sm"
        >
          {t("Back to level")}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-28 pb-16 px-4 sm:px-6 md:px-8 transition-colors ${
        isDark ? "bg-[#020617]" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push(`/scales/${levelCode}`)}
          className={`flex items-center gap-2 mb-8 text-sm font-medium ${
            isDark
              ? "text-gray-400 hover:text-yellow-400"
              : "text-gray-500 hover:text-yellow-600"
          } transition-colors`}
        >
          <ArrowLeft size={18} />
          {t("Back to")} {player.levelTitle || levelCode}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div
            className={`rounded-3xl border p-6 md:p-10 ${
              isDark ? "border-white/10 bg-[#030712]" : "border-gray-200 bg-white"
            } shadow-2xl`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black px-3 py-1 rounded-lg shadow-lg">
                    {player.levelTitle}
                  </span>
                  {scoreData?.total !== undefined && (
                    <span className={`text-xs font-black px-3 py-1 rounded-lg ${isDark ? "bg-black/60 border border-white/10 text-yellow-500" : "bg-gray-100 text-yellow-600"}`}>
                      S7: {scoreData.total}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {t("Compared to all players")} ({averageRatings?.totalRatings || 0} {t("reviews")})
                </p>
              </div>
              <span
                className={`text-xs font-bold px-4 py-1.5 rounded-xl uppercase tracking-wider ${ratingStatusColor} ${
                  isDark ? "bg-white/5 border border-white/10" : "bg-gray-100"
                }`}
              >
                {ratingStatus}
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-30 w-full max-w-4xl p-6 rounded-3xl bg-black/20 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent pointer-events-none" />

                <div className="flex flex-col items-center text-center flex-shrink-0">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-yellow-400/40 shadow-lg mb-2">
                    <Image
                      src={playerImage}
                      alt={player.fullName || player.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="w-20 h-0.5 bg-yellow-400/60 mb-2 rounded-full" />
                  
                  <h3 className={`text-base font-black uppercase tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                    {player.fullName || player.name}
                  </h3>
                  {player.position && (
                    <span className="text-[11px] font-semibold text-yellow-500 mt-0.5">
                      {player.position}
                    </span>
                  )}
                  {player.nationality && (
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {player.nationality} {player.age ? `· ${player.age} ${t("Y")}` : ""}
                    </span>
                  )}

                  <div className="mt-2.5 flex flex-col items-center gap-0.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[8px] text-gray-400 uppercase tracking-wider font-medium">
                      {t("Overall Score")}
                    </span>
                    <span className="text-base font-black text-yellow-400">
                      {Math.round(avgRating * 10) / 10}{" "}
                      <span className="text-[10px] text-gray-400 font-normal">
                        / 7
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400">
                      {totalPercentage}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center relative">
                  <SevenSkillsRadar skills={skills} size={280} />
                </div>
              </div>

              <div className="w-full max-w-3xl flex flex-col gap-2.5 mt-1">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
                      isDark
                        ? "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.05]"
                        : "bg-gray-50 border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-[160px] sm:min-w-[180px]">
                      <div
                        className="p-1.5 rounded-lg flex-shrink-0"
                        style={{
                          backgroundColor: `${skill.color}15`,
                          color: skill.color,
                        }}
                      >
                        <skill.icon size={15} />
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {skill.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <div
                        className={`flex-1 h-2.5 rounded-full overflow-hidden p-0.5 ${
                          isDark ? "bg-black/50" : "bg-gray-200"
                        }`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.value}%` }}
                          transition={{
                            duration: 1,
                            delay: 0.2 + index * 0.06,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full relative"
                          style={{
                            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}aa)`,
                            boxShadow: `0 0 8px ${skill.color}55`,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-md min-w-[42px] text-center flex-shrink-0"
                        style={{
                          backgroundColor: `${skill.color}20`,
                          color: skill.color,
                        }}
                      >
                        {Math.round(skill.value)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {breakdownSkills.length > 0 && (
                <Super7Breakdown items={breakdownSkills} isDark={isDark} />
              )}

              <div className="mt-6">
                <button
                  onClick={() => router.push(`/players/${playerId}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-105"
                >
                  <User size={16} />
                  {t("View Full Profile")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}