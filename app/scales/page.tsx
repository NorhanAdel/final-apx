"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Layers, Trophy } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GET_SUPER7_LEVELS } from "@/app/graphql/query/scale.queries";
import ScaleLevelCard from "@/app/components/ScaleLevelCard";

interface Super7Level {
  level: string;
  title: string;
  description: string;
  marketingTarget: string;
  context: string;
  minScore: number;
  maxScore: number;
}

export default function ScalesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const [levels, setLevels] = useState<Super7Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      setLoading(true);
      try {
        const result = await fetchGraphQL<{ super7Levels: Super7Level[] }>(
          GET_SUPER7_LEVELS,
        );
        if (result.data?.super7Levels) {
          // Sort descending by level number (S7_7 first)
          const sorted = [...result.data.super7Levels].sort((a, b) => {
            const numA = parseInt(a.level.replace("S7_", ""));
            const numB = parseInt(b.level.replace("S7_", ""));
            return numB - numA;
          });
          setLevels(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch Super7 levels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const handleLevelClick = (levelCode: string) => {
    router.push(`/scales/${levelCode}`);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#020617]" : "bg-gray-50"}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy
                size={20}
                className="text-yellow-400 animate-pulse"
              />
            </div>
          </div>
          <p
            className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("Loading scales...")}
          </p>
        </div>
      </div>
    );
  }

  const highestLevel = levels[0];
  const otherLevels = levels.slice(1);

  return (
    <div
      className={`min-h-screen pt-28 pb-16 px-4 sm:px-6 md:px-8 transition-colors ${isDark ? "bg-[#020617]" : "bg-gray-50"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-yellow-400/20">
              <Layers size={24} className="text-white" />
            </div>
          </div>
          <h1
            className={`text-4xl md:text-5xl font-black uppercase tracking-tight mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Super7
            </span>{" "}
            {t("Scale")}
          </h1>
          <p
            className={`text-sm md:text-base max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {t(
              "Discover player levels based on comprehensive performance metrics. Each level represents a tier of excellence.",
            )}
          </p>
        </motion.div>

        {/* Highest Level Hero Card */}
        {highestLevel && (
          <div className="mb-8">
            <ScaleLevelCard
              level={highestLevel.level}
              title={highestLevel.title}
              description={highestLevel.description}
              minScore={highestLevel.minScore}
              maxScore={highestLevel.maxScore}
              isHighest={true}
              onClick={() => handleLevelClick(highestLevel.level)}
            />
          </div>
        )}

        {/* Other Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {otherLevels.map((level, index) => (
            <ScaleLevelCard
              key={level.level}
              level={level.level}
              title={level.title}
              description={level.description}
              minScore={level.minScore}
              maxScore={level.maxScore}
              index={index}
              onClick={() => handleLevelClick(level.level)}
            />
          ))}
        </div>

        {/* Empty state */}
        {levels.length === 0 && !loading && (
          <div className="text-center py-20">
            <Layers
              size={48}
              className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`}
            />
            <p
              className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("No levels found")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
