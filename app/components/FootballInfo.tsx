"use client";

import { useEffect, useState } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import {
  GET_PLAYER_FOOTBALL_INFO,
  GET_MY_FOOTBALL_INFO,
  GET_SKILL_LEVEL_OPTIONS,
  GET_GOAL_OPTIONS,
} from "@/app/graphql/query/player.queries";
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
  skill_level?: string | null;
  playing_style?: string | null;
  professional_goals?: string[] | null;
  strengths?: string[] | null;
  market_value?: number | null;
  description?: string | null;
}

interface OptionItem {
  value: string;
  label: string;
}

interface FootballInfoProps {
  playerId?: string;
}

export default function FootballInfo({ playerId }: FootballInfoProps) {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";
  const [footballInfo, setFootballInfo] = useState<FootballData | null>(null);
  const [skillLevelOptions, setSkillLevelOptions] = useState<OptionItem[]>([]);
  const [goalOptions, setGoalOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFootballInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = null;

        if (playerId) {
          const result = await fetchGraphQL<any>(GET_PLAYER_FOOTBALL_INFO, {
            playerId,
          });
          if (!result.errors && result.data?.playerFootballInfo) {
            data = result.data.playerFootballInfo;
          }
        }

        if (!data) {
          const myResult = await fetchGraphQL<any>(GET_MY_FOOTBALL_INFO);
          if (!myResult.errors && myResult.data?.myFootballInfo) {
            data = myResult.data.myFootballInfo;
          }
        }

        setFootballInfo(data || null);
      } catch (err) {
        console.error("Error fetching football info:", err);
        setFootballInfo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFootballInfo();
  }, [playerId]);

  // Fetch backend-translated labels for skill level and professional goals,
  // same source of truth used in the edit form (GET_SKILL_LEVEL_OPTIONS / GET_GOAL_OPTIONS)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [skillRes, goalRes] = await Promise.all([
          fetchGraphQL<{ getSkillLevelOptions: OptionItem[] }>(
            GET_SKILL_LEVEL_OPTIONS,
            { lang },
          ),
          fetchGraphQL<{ getGoalOptions: OptionItem[] }>(GET_GOAL_OPTIONS, {
            lang,
          }),
        ]);
        if (skillRes.data?.getSkillLevelOptions) {
          setSkillLevelOptions(skillRes.data.getSkillLevelOptions);
        }
        if (goalRes.data?.getGoalOptions) {
          setGoalOptions(goalRes.data.getGoalOptions);
        }
      } catch (err) {
        console.error("Error fetching skill level/goal options:", err);
      }
    };
    fetchOptions();
  }, [lang]);

  const formatFoot = (foot?: string | null) => {
    if (!foot) return t("N/A");
    const formatted = foot.trim();
    const upper = formatted.toUpperCase();

    if (
      upper === "RIGHT" ||
      upper === "RIGHT FOOT" ||
      formatted === "يمنى" ||
      formatted === "القدم اليمنى"
    ) {
      return t("Right Foot");
    }
    if (
      upper === "LEFT" ||
      upper === "LEFT FOOT" ||
      formatted === "يسرى" ||
      formatted === "القدم اليسرى"
    ) {
      return t("Left Foot");
    }
    if (
      upper === "BOTH" ||
      upper === "BOTH FEET" ||
      formatted === "كلا القدمين" ||
      formatted === "كلتاهما"
    ) {
      return t("Both Feet");
    }

    return t(formatted);
  };

  // Look up the human-readable, backend-translated label for a skill level code
  // (e.g. "ADVANCED" -> "متطور: ألعب بشكل جيد ومتصاعد في المباريات.")
  const formatSkillLevel = (level?: string | null) => {
    if (!level) return t("N/A");
    const code = level.trim().toUpperCase();
    const match = skillLevelOptions.find((o) => o.value === code);
    return match?.label || level;
  };

  // Look up the human-readable, backend-translated labels for professional goal codes
  // (e.g. ["SKILL_DEVELOPMENT", "JOIN_ACADEMY"] -> translated labels joined)
  const formatProfessionalGoals = (goals?: string[] | null) => {
    if (!goals || goals.length === 0) return t("N/A");
    return goals
      .map((g) => {
        const code = g.trim().toUpperCase();
        const match = goalOptions.find((o) => o.value === code);
        return match?.label || g;
      })
      .join(isRTL ? "، " : ", ");
  };

  const textColor = isDark ? "text-gray-300" : "text-gray-700";
  const secondaryTextColor = isDark ? "text-gray-400" : "text-gray-500";

  if (loading) {
    return (
      <div className={`mt-8 ${isRTL ? "text-right" : "text-left"}`}>
        <h3 className="text-yellow-400 font-semibold mb-3">
          {t("Football Information")}
        </h3>
        <p className={`${secondaryTextColor} text-center mt-4`}>
          {t("Loading...")}
        </p>
      </div>
    );
  }

  if (!footballInfo) {
    return (
      <div className={`mt-8 ${isRTL ? "text-right" : "text-left"}`}>
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
    <div className={`mt-8 ${isRTL ? "text-right" : "text-left"}`}>
      <h3 className="text-yellow-400 font-semibold mb-3">
        {t("Football Information")}
      </h3>
      <ul className={`space-y-2 text-sm ${isRTL ? "text-right" : "text-left"}`}>
        <li className={textColor}>
          {isRTL ? (
            <span>
              <strong>{t("Position")}: </strong>
              {footballInfo.position?.name || t("N/A")}
            </span>
          ) : (
            <>
              <strong>{t("Position")}:</strong>
              <span> {footballInfo.position?.name || t("N/A")}</span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <span>
              <strong>{t("Preferred Foot")}: </strong>
              {formatFoot(footballInfo.preferred_foot)}
            </span>
          ) : (
            <>
              <strong>{t("Preferred Foot")}:</strong>
              <span> {formatFoot(footballInfo.preferred_foot)}</span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <span>
              <strong>{t("Jersey Number")}: </strong>
              {footballInfo.jersey_number ?? t("N/A")}
            </span>
          ) : (
            <>
              <strong>{t("Jersey Number")}:</strong>
              <span> {footballInfo.jersey_number ?? t("N/A")}</span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <span>
              <strong>{t("Skill Level")}: </strong>
              {formatSkillLevel(
                footballInfo.skill_level || footballInfo.playing_style,
              )}
            </span>
          ) : (
            <>
              <strong>{t("Skill Level")}:</strong>
              <span>
                {" "}
                {formatSkillLevel(
                  footballInfo.skill_level || footballInfo.playing_style,
                )}
              </span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <span>
              <strong>{t("Professional Goals")}: </strong>
              {formatProfessionalGoals(
                footballInfo.professional_goals || footballInfo.strengths,
              )}
            </span>
          ) : (
            <>
              <strong>{t("Professional Goals")}:</strong>
              <span>
                {" "}
                {formatProfessionalGoals(
                  footballInfo.professional_goals || footballInfo.strengths,
                )}
              </span>
            </>
          )}
        </li>

        {footballInfo.description && (
          <li className={`${textColor} ${isRTL ? "text-right" : "text-left"}`}>
            <strong>{t("Description")}:</strong>
            <p
              className={`mt-1 ${secondaryTextColor} leading-relaxed ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {footballInfo.description}
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}
