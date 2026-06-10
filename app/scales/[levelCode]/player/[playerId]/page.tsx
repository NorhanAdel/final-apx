"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  User,
  Eye,
  Star,
  TrendingUp,
  Brain,
  Activity,
  Target,
  Shield,
  Award,
  Calendar,
  BarChart3,
  Heart,
  Zap,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import {
  GET_PLAYER_SUPER7_SCORE,
  GET_PLAYERS_BY_LEVEL,
} from "@/app/graphql/query/scale.queries";
import { GET_PLAYER_AVERAGE_RATINGS } from "@/app/graphql/query/rating.queries";
import CircularScoreGauge from "@/app/components/CircularScoreGauge";

interface RatingsDetails {
  totalRatings: number;
  averageStars: number;
  averagePercentage: number;
  scalabilityPercent: number;
  mentalStabilityPercent: number;
  soccerIntelligencePercent: number;
  physicalFitnessPercent: number;
  technicalSkillPercent: number;
  tacticalVisionPercent: number;
  republicanInfluencePercent: number;
}

interface Super7Breakdown {
  userRating: number;
  transferValue: number;
  favoriteCount: number;
  profileViews: number;
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

  // Fetch player data from playersByLevel
  useEffect(() => {
    const fetchPlayer = async () => {
      setLoading(true);
      try {
        // Fetch players in this level and find our player
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

  // Fetch Super7 score breakdown
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

  // Fetch average ratings if not available from player data
  useEffect(() => {
    const fetchRatings = async () => {
      if (averageRatings) return; // Already have it from playersByLevel
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

  const playerImage = player?.profileImageUrl
    ? player.profileImageUrl.startsWith("http")
      ? player.profileImageUrl
      : `${process.env.NEXT_PUBLIC_API_URL}${player.profileImageUrl}`
    : "/b2.jpg";

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#020617]" : "bg-gray-50"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Star size={20} className="text-yellow-400 animate-pulse" />
            </div>
          </div>
          <p
            className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
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
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDark ? "bg-[#020617]" : "bg-gray-50"}`}
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
      className={`min-h-screen pt-28 pb-16 px-4 sm:px-6 md:px-8 transition-colors ${isDark ? "bg-[#020617]" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push(`/scales/${levelCode}`)}
          className={`flex items-center gap-2 mb-8 text-sm font-medium ${isDark ? "text-gray-400 hover:text-yellow-400" : "text-gray-500 hover:text-yellow-600"} transition-colors`}
        >
          <ArrowLeft size={18} />
          {t("Back to")} {player.levelTitle || levelCode}
        </motion.button>

        {/* Player Info Section: Photo Left + Details Right */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`rounded-2xl overflow-hidden border mb-8 ${isDark ? "border-white/10 bg-[#030712]" : "border-gray-200 bg-white"} shadow-xl`}
        >
          <div className="flex flex-col md:flex-row">
            {/* LEFT — Photo Only */}
            <div className="relative w-full md:w-[340px] lg:w-[400px] flex-shrink-0">
              <div className="relative aspect-[3/4] md:aspect-auto md:h-full w-full min-h-[400px]">
                <Image
                  src={playerImage}
                  alt={player.fullName || player.name}
                  fill
                  className="object-cover object-top"
                  priority
                />
                {/* Subtle gradient on right edge for desktop blending */}
                <div
                  className={`hidden md:block absolute inset-y-0 right-0 w-16 bg-gradient-to-l ${isDark ? "from-[#030712]" : "from-white"} to-transparent`}
                />
                {/* Bottom gradient for mobile */}
                <div
                  className={`md:hidden absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${isDark ? "from-[#030712]" : "from-white"} to-transparent`}
                />

                {/* Level badge overlay */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black px-3 py-1.5 rounded-lg shadow-lg">
                  {player.levelTitle}
                </div>

                {/* Score overlay */}
                <div
                  className={`absolute top-4 right-4 ${isDark ? "bg-black/60" : "bg-white/80"} backdrop-blur-sm px-3 py-1.5 rounded-lg`}
                >
                  <span className="text-sm font-black text-yellow-500">
                    S7: {player.super7Score}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — All Player Details */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
              {/* Name */}
              <h1
                className={`text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {player.fullName || player.name}
              </h1>

              {/* Player Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {player.position && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}
                    >
                      <BarChart3 size={18} className="text-yellow-500" />
                    </div>
                    <div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {t("Position")}
                      </span>
                      <p
                        className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {player.position}
                      </p>
                    </div>
                  </div>
                )}

                {player.nationality && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}
                    >
                      <MapPin size={18} className="text-yellow-500" />
                    </div>
                    <div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {t("Nationality")}
                      </span>
                      <p
                        className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {player.nationality}
                        {player.country && player.country !== player.nationality
                          ? ` · ${player.country}`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}

                {player.age !== undefined && player.age > 0 && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}
                    >
                      <Calendar size={18} className="text-yellow-500" />
                    </div>
                    <div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {t("Age")}
                      </span>
                      <p
                        className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {player.age} {t("years old")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}
                  >
                    <Eye size={18} className="text-yellow-500" />
                  </div>
                  <div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {t("Views")}
                    </span>
                    <p
                      className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}
                    >
                      {player.viewsCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              {(scoreData?.breakdown || player.super7Breakdown) && (
                <div
                  className={`pt-6 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}
                >
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {t("Score Breakdown")}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: t("User Rating"),
                        value:
                          scoreData?.breakdown?.userRating ??
                          player.super7Breakdown?.userRating ??
                          0,
                        icon: Star,
                      },
                      {
                        label: t("Transfer Value"),
                        value:
                          scoreData?.breakdown?.transferValue ??
                          player.super7Breakdown?.transferValue ??
                          0,
                        icon: Zap,
                      },
                      {
                        label: t("Favorites"),
                        value:
                          scoreData?.breakdown?.favoriteCount ??
                          player.super7Breakdown?.favoriteCount ??
                          0,
                        icon: Heart,
                      },
                      {
                        label: t("Profile Views"),
                        value:
                          scoreData?.breakdown?.profileViews ??
                          player.super7Breakdown?.profileViews ??
                          0,
                        icon: Eye,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`p-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon
                            size={12}
                            className="text-yellow-500"
                          />
                          <span
                            className={`text-[10px] font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={`text-lg font-black ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View Full Profile Button */}
              <div className="mt-6">
                <button
                  onClick={() => router.push(`/players/${playerId}`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 hover:scale-105"
                >
                  <User size={16} />
                  {t("View Full Profile")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ratings & Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div
            className={`rounded-2xl border p-6 md:p-8 ${isDark ? "border-white/10 bg-[#030712]" : "border-gray-200 bg-white"} shadow-xl`}
          >
            {/* Rating Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-yellow-400">
                {t("PLAYER RATING")}
              </h2>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${ratingStatusColor} ${isDark ? "bg-white/5" : "bg-gray-50"}`}
              >
                {ratingStatus}
              </span>
            </div>
            <p
              className={`text-sm mb-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("Compared to all players")}
            </p>

            {/* Content: Circle + Skills */}
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Circular Score */}
              <div className="lg:w-2/5 flex flex-col items-center">
                <CircularScoreGauge
                  score={avgRating}
                  maxScore={7}
                  percentage={
                    averageRatings?.averagePercentage
                      ? Math.round(averageRatings.averagePercentage)
                      : undefined
                  }
                  size={260}
                  label={`${averageRatings?.totalRatings || 0} ${t("reviews")}`}
                />
              </div>

              {/* Skills Breakdown */}
              <div className="lg:w-3/5 w-full">
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.3 + index * 0.08,
                      }}
                      className="group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div style={{ color: skill.color }}>
                            <skill.icon size={16} />
                          </div>
                          <span
                            className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
                          >
                            {skill.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                        >
                          {Math.round(skill.value)}%
                        </span>
                      </div>

                      <div
                        className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-200"}`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${skill.value}%`,
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.5 + index * 0.1,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* No ratings state */}
                {skills.length === 0 && (
                  <div className="text-center py-12">
                    <Star
                      size={32}
                      className={`mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`}
                    />
                    <p
                      className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {t("No ratings available yet")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
