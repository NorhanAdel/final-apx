"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import {
  GET_PLAYERS_BY_LEVEL,
  GET_SUPER7_LEVELS,
} from "@/app/graphql/query/scale.queries";
import ScalePlayerCard from "@/app/components/ScalePlayerCard";

interface Super7Level {
  level: string;
  title: string;
  description: string;
  marketingTarget: string;
  context: string;
  minScore: number;
  maxScore: number;
}

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

interface LevelPlayer {
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
  super7Breakdown?: {
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
  };
  viewsCount: number;
  createdAt: string;
  position?: string;
  ratingsDetails?: RatingsDetails;
}

const PAGE_SIZE = 12;

export default function PlayersByLevelPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const levelCode = params.levelCode as string;

  const [players, setPlayers] = useState<LevelPlayer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [levelInfo, setLevelInfo] = useState<Super7Level | null>(null);

  useEffect(() => {
    const fetchLevelInfo = async () => {
      try {
        const result = await fetchGraphQL<{ super7Levels: Super7Level[] }>(
          GET_SUPER7_LEVELS,
        );
        if (result.data?.super7Levels) {
          const found = result.data.super7Levels.find(
            (l) => l.level === levelCode,
          );
          if (found) setLevelInfo(found);
        }
      } catch (error) {
        console.error("Failed to fetch level info:", error);
      }
    };
    fetchLevelInfo();
  }, [levelCode]);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{
        playersByLevel: { data: LevelPlayer[]; total: number };
      }>(GET_PLAYERS_BY_LEVEL, {
        levelCode,
        searchTerm: searchTerm.trim() || undefined,
        limit: PAGE_SIZE,
        skip: currentPage * PAGE_SIZE,
      });

      if (result.data?.playersByLevel) {
        setPlayers(result.data.playersByLevel.data || []);
        setTotal(result.data.playersByLevel.total || 0);
      } else {
        setPlayers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Failed to fetch players by level:", error);
      setPlayers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [levelCode, searchTerm, currentPage]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handlePlayerClick = (playerId: string) => {
    router.push(`/scales/${levelCode}/player/${playerId}`);
  };

  const bg = isDark ? "bg-[#020617]" : "bg-gray-50";
  const text = isDark ? "text-white" : "text-gray-900";
  const card = isDark ? "bg-[#030816]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-gray-300";
  const accent = isDark ? "text-[#eab308]" : "text-yellow-600";

  return (
    <div
      className={`min-h-screen pt-28 pb-16 px-4 sm:px-6 md:px-8 transition-colors ${bg} ${text}`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/scales")}
          className={`flex items-center gap-2 mb-6 text-sm font-medium ${isDark ? "text-gray-400 hover:text-yellow-400" : "text-gray-500 hover:text-yellow-600"} transition-colors`}
        >
          <ArrowLeft size={18} />
          {t("Back to Scales")}
        </motion.button>

        {levelInfo && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                {levelCode.replace("_", " ")}
              </span>
              <span
                className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("Score Range")}: {levelInfo.minScore} — {levelInfo.maxScore}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
              {levelInfo.title}
            </h1>
            <p
              className={`text-sm max-w-3xl ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {levelInfo.description}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${accent} opacity-60`}
              size={18}
            />
            <input
              type="text"
              placeholder={t("Search players in this level...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-lg py-3 pl-12 pr-4 text-sm font-medium border focus:outline-none transition ${card} ${border} ${accent} focus:border-yellow-500/50`}
            />
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"}`}
          >
            <Users size={16} className="text-yellow-500" />
            <span className={`text-sm font-bold ${accent}`}>
              {total} {t("Players")}
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`rounded-xl overflow-hidden ${card} border ${border}`}
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-gray-700/20 to-gray-800/20 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-700/20 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-700/20 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20">
            <Users
              size={48}
              className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`}
            />
            <p
              className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("No players found in this level")}
            </p>
            {searchTerm && (
              <p
                className={`text-sm mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("Try adjusting your search term")}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ScalePlayerCard
                    id={player.id}
                    name={player.fullName || player.name}
                    level={player.level}
                    profileImageUrl={player.profileImageUrl}
                    nationality={player.nationality}
                    age={player.age}
                    super7Score={player.super7Score}
                    levelTitle={player.levelTitle}
                    position={player.position}
                    averageStars={player.ratingsDetails?.averageStars}
                    onClick={() => handlePlayerClick(player.id)}
                  />
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(0, p - 1))
                  }
                  disabled={currentPage === 0}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentPage === 0
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:border-yellow-400/50"
                  } ${isDark ? "border-white/10 text-gray-300" : "border-gray-300 text-gray-600"}`}
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map(
                    (_, i) => {
                      let pageNum = i;
                      if (totalPages > 5) {
                        const start = Math.max(
                          0,
                          Math.min(currentPage - 2, totalPages - 5),
                        );
                        pageNum = start + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                              : isDark
                                ? "text-gray-400 hover:bg-white/10"
                                : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages - 1, p + 1),
                    )
                  }
                  disabled={currentPage >= totalPages - 1}
                  className={`p-2 rounded-lg border transition-colors ${
                    currentPage >= totalPages - 1
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:border-yellow-400/50"
                  } ${isDark ? "border-white/10 text-gray-300" : "border-gray-300 text-gray-600"}`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}