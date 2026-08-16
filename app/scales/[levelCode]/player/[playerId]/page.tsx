"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Target,
  Activity,
  Brain,
  Shield,
  Award,
  TrendingUp,
  Eye,
  Users,
  Zap,
  Heart,
  UserCheck,
} from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";

import {
  GET_PLAYER_SUPER7_SCORE,
  GET_PLAYERS_BY_LEVEL,
  GET_SUPER7_SCORE_PERCENTAGES,
  GET_PLAYER_AI_SKILLS,
} from "@/app/graphql/query/scale.queries";

import LoadingPlayer from "@/app/components/scale-player/LoadingPlayer";
import PlayerNotFound from "@/app/components/scale-player/PlayerNotFound";
import PlayerHeaderSection from "@/app/components/scale-player/PlayerHeaderSection";
import SkillsRadarSection from "@/app/components/scale-player/SkillsRadarSection";
import RatingSummarySection from "@/app/components/scale-player/RatingSummarySection";
import Super7BreakdownSection from "@/app/components/scale-player/Super7BreakdownSection";

import {
  PlayerData,
  Super7Score,
  Super7ScorePercentages,
} from "@/app/components/scale-player/types";

interface PlayerAISkillsResponse {
  technicalSkill: number;
  physicalFitness: number;
  gameIntelligence: number;
  mentalResilience: number;
  professionalism: number;
  growthPotential: number;
  marketReadiness: number;
  averagePercentage: number;
}

export default function ScalePlayerDetailPage() {
  const params = useParams();
  const router = useRouter();

  const { theme } = useTheme();
  const { t, lang } = useTranslate();

  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const shouldReduceMotion = useReducedMotion();

  const rawLevelParam = params?.levelCode;
  const rawLevelCode = Array.isArray(rawLevelParam)
    ? rawLevelParam[0]
    : (rawLevelParam as string) || "";
  const levelCode = rawLevelCode.toUpperCase();

  const rawPlayerId = params?.playerId;
  const playerId = Array.isArray(rawPlayerId)
    ? rawPlayerId[0]
    : (rawPlayerId as string) || "";

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [scoreData, setScoreData] = useState<Super7Score | null>(null);
  const [scorePercentages, setScorePercentages] =
    useState<Super7ScorePercentages | null>(null);
  const [playerAISkills, setPlayerAISkills] = useState<PlayerAISkillsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     FETCH DATA
  ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [playerResult, scoreResult, percentagesResult, aiSkillsResult] =
          await Promise.all([
            fetchGraphQL<{ playersByLevel: { data: PlayerData[] } }>(
              GET_PLAYERS_BY_LEVEL,
              {
                levelCode: levelCode.toUpperCase(),
                limit: 100,
                skip: 0,
              },
            ),

            fetchGraphQL<{ playerSuper7Score: Super7Score }>(
              GET_PLAYER_SUPER7_SCORE,
              {
                playerId,
              },
            ),

            fetchGraphQL<{
              super7ScorePercentages: Super7ScorePercentages;
            }>(GET_SUPER7_SCORE_PERCENTAGES),

            fetchGraphQL<{
              playerAISkills: PlayerAISkillsResponse;
            }>(GET_PLAYER_AI_SKILLS, {
              playerId,
            }),
          ]);

        if (playerResult.data?.playersByLevel?.data) {
          const found = playerResult.data.playersByLevel.data.find(
            (p) => p.id === playerId,
          );

          if (found) {
            setPlayer(found);
          }
        }

        if (scoreResult.data?.playerSuper7Score) {
          setScoreData(scoreResult.data.playerSuper7Score);
        }

        if (percentagesResult.data?.super7ScorePercentages) {
          setScorePercentages(percentagesResult.data.super7ScorePercentages);
        }

        if (aiSkillsResult.data?.playerAISkills) {
          setPlayerAISkills(aiSkillsResult.data.playerAISkills);
        }
      } catch (error) {
        console.error("Failed to fetch player details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (playerId && levelCode) {
      fetchData();
    }
  }, [levelCode, playerId]);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const aiSkills = playerAISkills;

  const skills = useMemo(
    () =>
      aiSkills
        ? [
            {
              name: t("Technical Skill"),
              value: aiSkills.technicalSkill,
              icon: Target,
              color: "#F59E0B",
            },
            {
              name: t("Physical Fitness"),
              value: aiSkills.physicalFitness,
              icon: Activity,
              color: "#10B981",
            },
            {
              name: t("Game Intelligence"),
              value: aiSkills.gameIntelligence,
              icon: Brain,
              color: "#6366F1",
            },
            {
              name: t("Mental Resilience"),
              value: aiSkills.mentalResilience,
              icon: Shield,
              color: "#8B5CF6",
            },
            {
              name: t("Professionalism"),
              value: aiSkills.professionalism,
              icon: Award,
              color: "#EAB308",
            },
            {
              name: t("Growth Potential"),
              value: aiSkills.growthPotential,
              icon: TrendingUp,
              color: "#3B82F6",
            },
            {
              name: t("Market Readiness"),
              value: aiSkills.marketReadiness,
              icon: Eye,
              color: "#EF4444",
            },
          ]
        : [],
    [aiSkills, t],
  );

  const totalPercentage = aiSkills?.averagePercentage || 0;

  const ratingStatus = t("AI ANALYSIS");
  const ratingStatusColor = "text-emerald-500";

  const breakdownData = scoreData?.breakdown || player?.super7Breakdown;

  const getBreakdownValue = (value: number, maxWeight: number) => {
    if (!maxWeight || maxWeight <= 0) return 0;
    return Math.min(Math.round((value / maxWeight) * 100), 100);
  };

  const breakdownItems =
    breakdownData && scorePercentages
      ? [
          {
            name: t("Admin Rating"),
            value: getBreakdownValue(
              breakdownData.adminRating || 0,
              scorePercentages.ADMIN,
            ),
            icon: Shield,
            color: "#8B5CF6",
            bgColor: "rgba(139,92,246,0.13)",
          },
          {
            name: t("External Rating"),
            value: getBreakdownValue(
              breakdownData.externalGroupRating || 0,
              scorePercentages.EXTERNAL_GROUPS,
            ),
            icon: Users,
            color: "#06B6D4",
            bgColor: "rgba(6,182,212,0.13)",
          },
          {
            name: t("AI Analysis"),
            value: getBreakdownValue(
              breakdownData.aiAnalysisScore || 0,
              scorePercentages.AI_ANALYSIS,
            ),
            icon: Brain,
            color: "#10B981",
            bgColor: "rgba(16,185,129,0.13)",
          },
          {
            name: t("Player Self Rating"),
            value: getBreakdownValue(
              breakdownData.playerSelfRating || 0,
              scorePercentages.PLAYER_SELF || 5,
            ),
            icon: UserCheck,
            color: "#3B82F6",
            bgColor: "rgba(59,130,246,0.13)",
          },
          {
            name: t("Transfer Value"),
            value: getBreakdownValue(
              breakdownData.transferValue || 0,
              scorePercentages.TRANSFER_VALUE,
            ),
            icon: Zap,
            color: "#EAB308",
            bgColor: "rgba(234,179,8,0.13)",
          },
          {
            name: t("Favorites"),
            value: getBreakdownValue(
              breakdownData.favoriteCount || 0,
              scorePercentages.FAVORITE_COUNT,
            ),
            icon: Heart,
            color: "#EF4444",
            bgColor: "rgba(239,68,68,0.13)",
          },
          {
            name: t("Profile Views"),
            value: getBreakdownValue(
              breakdownData.profileViews || 0,
              scorePercentages.PROFILE_VIEWS,
            ),
            icon: Eye,
            color: "#6366F1",
            bgColor: "rgba(99,102,241,0.13)",
          },
          {
            name: t("BMI Score"),
            value: getBreakdownValue(
              breakdownData.bmiScore || 0,
              scorePercentages.BMI_SCORE,
            ),
            icon: Activity,
            color: "#EC4899",
            bgColor: "rgba(236,72,153,0.13)",
          },
        ]
      : [];

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <LoadingPlayer
        isDark={isDark}
        text={t("Loading player details...")}
      />
    );
  }

  /* =========================================================
     NOT FOUND STATE
  ========================================================= */

  if (!player) {
    return (
      <PlayerNotFound
        levelCode={levelCode}
        text={t("Player not found")}
        backText={t("Back to level")}
        isDark={isDark}
      />
    );
  }

  /* =========================================================
     PAGE RENDER
  ========================================================= */

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className={`relative min-h-screen overflow-hidden pt-24 pb-20 transition-colors duration-500 ${
        isDark ? "bg-[#020617] text-white" : "bg-[#F7F8FA] text-slate-900"
      }`}
    >
      {/* BACKGROUND SYSTEM */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, 40, -20, 0],
                  y: [0, -20, 30, 0],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -top-40 ${
            isRTL ? "-left-40" : "-right-40"
          } w-[500px] h-[500px] rounded-full blur-[130px] ${
            isDark ? "bg-amber-500/[0.08]" : "bg-amber-300/[0.18]"
          }`}
        />

        <motion.div
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, -30, 20, 0],
                  y: [0, 30, -20, 0],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute bottom-0 ${
            isRTL ? "-right-40" : "-left-40"
          } w-[500px] h-[500px] rounded-full blur-[140px] ${
            isDark ? "bg-indigo-500/[0.07]" : "bg-indigo-300/[0.10]"
          }`}
        />

        {/* Grid */}
        <div
          className={`absolute inset-0 opacity-[0.035] ${
            isDark ? "block" : "hidden"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* BACK BUTTON */}
        <motion.button
          initial={{
            opacity: 0,
            x: isRTL ? 20 : -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          whileHover={{
            x: isRTL ? 4 : -4,
          }}
          onClick={() => router.push(`/scales/${levelCode}`)}
          className={`group flex items-center gap-2 mb-7 text-xs font-bold ${
            isDark
              ? "text-slate-500 hover:text-amber-400"
              : "text-slate-500 hover:text-amber-600"
          } transition-colors`}
        >
          <ArrowLeft
            size={16}
            className={`transition-transform duration-300 ${
              isRTL
                ? "rotate-180 group-hover:-translate-x-1"
                : "group-hover:-translate-x-1"
            }`}
          />

          <span>
            {t("Back to")} {player.levelTitle || levelCode}
          </span>
        </motion.button>

        {/* HERO SECTION */}
        <PlayerHeaderSection
          player={player}
          avgRating={0}
          totalPercentage={totalPercentage}
          totalRatings={0}
          isDark={isDark}
          isRTL={isRTL}
          shouldReduceMotion={shouldReduceMotion}
          onExploreClick={() => router.push(`/players/${playerId}`)}
        />

        {/* PERFORMANCE & SKILLS SECTION - Now using AI skills */}
        <SkillsRadarSection skills={skills} isDark={isDark} />

        {/* RATING SUMMARY SECTION - Now showing AI analysis */}
        <RatingSummarySection
          avgRating={0}
          totalPercentage={totalPercentage}
          ratingStatus={ratingStatus}
          ratingStatusColor={ratingStatusColor}
          isDark={isDark}
        />

        {/* SUPER7 BREAKDOWN SECTION */}
        {scoreData && breakdownItems.length > 0 && (
          <Super7BreakdownSection
            scoreData={scoreData}
            breakdownItems={breakdownItems}
            isDark={isDark}
          />
        )}

        {/* FOOTER DECORATION */}
        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          className="flex items-center justify-center gap-4 mt-10"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-500/20" />

          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles size={12} />
            <span className="text-[9px] uppercase tracking-[0.3em] font-black">
              {t("PLAYER ANALYTICS")}
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-500/20" />
        </motion.div>
      </div>
    </main>
  );
}