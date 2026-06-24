"use client";

import { useEffect, useState } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GET_PLAYER_FOOTBALL_INFO } from "@/app/graphql/query/player.queries";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";

interface Position {
  id: string;
  name: string;
  category: string;
}

interface FootballData {
  id: string;
  player_id: string;
  position?: Position | null;
  preferred_foot?: string | null;
  jersey_number?: number | null;
  playing_style?: string | null;
  strengths?: string[] | null;
  market_value?: number | null;
  description?: string | null;
}

interface FootballInfoProps {
  playerId: string;
}

export default function FootballInfo({ playerId }: FootballInfoProps) {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";
  const [footballInfo, setFootballInfo] = useState<FootballData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFootballInfo = async () => {
      if (!playerId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchGraphQL<{ playerFootballInfo: FootballData }>(
          GET_PLAYER_FOOTBALL_INFO,
          { playerId },
        );
        if (result.errors) {
          console.error("GraphQL Errors:", result.errors);
          setError(t("Failed to load football info"));
          return;
        }
        setFootballInfo(result.data?.playerFootballInfo || null);
      } catch (err) {
        console.error(err);
        setError(t("Failed to load football info"));
      } finally {
        setLoading(false);
      }
    };
    fetchFootballInfo();
  }, [playerId, t]);

  const formatMarketValue = (value?: number | null) => {
    if (!value) return t("N/A");
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M €`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K €`;
    return `${value} €`;
  };

  const formatStrengths = (strengths?: string[] | null) => {
    if (!strengths || strengths.length === 0) return t("N/A");
    return strengths.join(", ");
  };

  const textColor = isDark ? "text-gray-300" : "text-gray-700";
  const secondaryTextColor = isDark ? "text-gray-400" : "text-gray-500";

  if (loading) {
    return (
      <div className="mt-8 text-left">
        <h3 className="text-yellow-400 font-semibold mb-3">
          {t("Football Information")}
        </h3>
        <p className={`${secondaryTextColor} text-center mt-4`}>
          {t("Loading...")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-left">
        <h3 className="text-yellow-400 font-semibold mb-3">
          {t("Football Information")}
        </h3>
        <p className="text-red-500 text-center mt-4">{error}</p>
      </div>
    );
  }

  if (!footballInfo) {
    return (
      <div className="mt-8 text-left">
        <h3 className="text-yellow-400 font-semibold mb-3">
          {t("Football Information")}
        </h3>
        <p className={`${secondaryTextColor} text-center mt-4`}>
          {t("No football info available")}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 text-left">
      <h3 className="text-yellow-400 font-semibold mb-3">
        {t("Football Information")}
      </h3>
      <ul className="space-y-2 text-sm">
        <li className={textColor}>
          <strong>{t("Position")}:</strong>{" "}
          {footballInfo.position?.name || t("N/A")}
        </li>
        <li className={textColor}>
          <strong>{t("Preferred Foot")}:</strong>{" "}
          {footballInfo.preferred_foot || t("N/A")}
        </li>
        <li className={textColor}>
          <strong>{t("Jersey Number")}:</strong>{" "}
          {footballInfo.jersey_number ?? t("N/A")}
        </li>
        <li className={textColor}>
          <strong>{t("Playing Style")}:</strong>{" "}
          {footballInfo.playing_style || t("N/A")}
        </li>
        <li className={textColor}>
          <strong>{t("Strengths")}:</strong>{" "}
          {formatStrengths(footballInfo.strengths)}
        </li>
        
        {footballInfo.description && (
          <li className={textColor}>
            <strong>{t("Description")}:</strong>
            <p className={`mt-1 ${secondaryTextColor} leading-relaxed`}>
              {footballInfo.description}
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
