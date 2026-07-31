"use client";

import { useEffect, useState } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GET_PLAYER_FOOTBALL_INFO, GET_MY_FOOTBALL_INFO } from "@/app/graphql/query/player.queries";
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

interface FootballInfoProps {
  playerId?: string;
}

export default function FootballInfo({ playerId }: FootballInfoProps) {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";
  const [footballInfo, setFootballInfo] = useState<FootballData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFootballInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = null;

        if (playerId) {
          const result = await fetchGraphQL<any>(
            GET_PLAYER_FOOTBALL_INFO,
            { playerId },
          );
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

  const formatFoot = (foot?: string | null) => {
    if (!foot) return t("N/A");
    const formatted = foot.trim();
    const upper = formatted.toUpperCase();
    
    if (upper === "RIGHT" || upper === "RIGHT FOOT" || formatted === "يمنى" || formatted === "القدم اليمنى") {
      return t("Right Foot");
    }
    if (upper === "LEFT" || upper === "LEFT FOOT" || formatted === "يسرى" || formatted === "القدم اليسرى") {
      return t("Left Foot");
    }
    if (upper === "BOTH" || upper === "BOTH FEET" || formatted === "كلا القدمين" || formatted === "كلتاهما") {
      return t("Both Feet");
    }
    
    return t(formatted);
  };

  const formatSkillLevel = (level?: string | null) => {
    if (!level) return t("N/A");
    const formatted = level.trim();
    const upper = formatted.toUpperCase();

    const levelMap: Record<string, string> = {
      BEGINNER: t("مبتدئ"),
      INTERMEDIATE: t("متوسط"),
      ADVANCED: t("متطور"),
      EXPERT: t("متقدم"),
      COMPETITIVE: t("منافس"),
      SEMI_PRO: t("شبه محترف"),
      PROFESSIONAL: t("محترف"),
    };

    return levelMap[upper] || t(formatted);
  };

  const formatProfessionalGoals = (goals?: string[] | null) => {
    if (!goals || goals.length === 0) return t("N/A");
    const goalMap: Record<string, string> = {
      DEVELOP_SKILLS: t("تطوير المهارات الرياضية"),
      JOIN_ACADEMY: t("الانضمام لأكاديمية محترفة"),
      SIGN_CONTRACT: t("توقيع عقد احترافي"),
      FIRST_TEAM_CONTRACT: t("توقيع عقد مع فريق أول"),
      NATIONAL_TEAM: t("تمثيل المنتخب الوطني"),
      EUROPEAN_TRANSFER: t("الاحتراف الخارجي / الأوروبي"),
      INTERNATIONAL_TRANSFER: t("الاحتراف الخارجي"),
      SERIOUS_OFFERS: t("تلقي عروض من أندية رسمية"),
    };
    return goals.map((g) => goalMap[g.trim().toUpperCase()] || t(g)).join(", ");
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
              {formatSkillLevel(footballInfo.skill_level || footballInfo.playing_style)}
            </span>
          ) : (
            <>
              <strong>{t("Skill Level")}:</strong>
              <span> {formatSkillLevel(footballInfo.skill_level || footballInfo.playing_style)}</span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <span>
              <strong>{t("Professional Goals")}: </strong>
              {formatProfessionalGoals(footballInfo.professional_goals || footballInfo.strengths)}
            </span>
          ) : (
            <>
              <strong>{t("Professional Goals")}:</strong>
              <span> {formatProfessionalGoals(footballInfo.professional_goals || footballInfo.strengths)}</span>
            </>
          )}
        </li>
        
        {footballInfo.description && (
          <li className={`${textColor} ${isRTL ? "text-right" : "text-left"}`}>
            <strong>{t("Description")}:</strong>
            <p className={`mt-1 ${secondaryTextColor} leading-relaxed ${
              isRTL ? "text-right" : "text-left"
            }`}>
              {footballInfo.description}
            </p>
          </li>
        )}
      </ul>
    </div>
  );
}