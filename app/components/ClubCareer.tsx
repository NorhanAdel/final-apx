"use client";

import { useEffect, useState } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GET_PLAYER_CLUB_CAREER } from "@/app/graphql/query/player.queries";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";

interface ClubCareerData {
  id: string;
  current_club?: string | null;
  professional_debut?: string | Date | null;
  previous_clubs?: string | null;
}

interface ClubCareerProps {
  playerId: string;
}

export default function ClubCareer({ playerId }: ClubCareerProps) {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";
  const [clubCareer, setClubCareer] = useState<ClubCareerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubCareer = async () => {
      if (!playerId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchGraphQL<{ playerClubCareer: ClubCareerData }>(
          GET_PLAYER_CLUB_CAREER,
          { playerId },
        );
        if (result.errors) {
          console.error("GraphQL Errors:", result.errors);
          setError(t("Failed to load club career"));
          return;
        }
        setClubCareer(result.data?.playerClubCareer || null);
      } catch (err) {
        console.error(err);
        setError(t("Failed to load club career"));
      } finally {
        setLoading(false);
      }
    };
    fetchClubCareer();
  }, [playerId, t]);

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return t("N/A");
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return t("N/A");
    }
  };

  const textColor = isDark ? "text-gray-300" : "text-gray-700";
  const secondaryTextColor = isDark ? "text-gray-400" : "text-gray-500";

  if (loading) {
    return (
      <div className={`mt-8 ${isRTL ? "text-right" : "text-left"}`}>
        <h3 className="text-yellow-400 font-semibold mb-3">
          {t("Club Career")}
        </h3>
        <p className={`${secondaryTextColor} text-center mt-4`}>
          {t("Loading...")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-8 ${isRTL ? "text-right" : "text-left"}`}>
        <h3 className="text-yellow-400 font-semibold mb-3">
          {t("Club Career")}
        </h3>
        <p className="text-red-500 text-center mt-4">{error}</p>
      </div>
    );
  }

  if (!clubCareer) {
    return (
      <div className={`mt-8 ${isRTL ? "text-right" : "text-left"}`}>
        <h3 className="text-yellow-400 font-semibold mb-3">
          {t("Club Career")}
        </h3>
        <p className={`${secondaryTextColor} text-center mt-4`}>
          {t("No club career information available")}
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-8 ${isRTL ? "text-right" : "text-left"}`}>
      <h3 className="text-yellow-400 font-semibold mb-3">{t("Club Career")}</h3>
      <ul className={`space-y-2 text-sm ${isRTL ? "text-right" : "text-left"}`}>
        <li className={textColor}>
          {isRTL ? (
            <>
              <span>{clubCareer.current_club || t("N/A")}</span>
              <strong> :{t("Current Club")}</strong>
            </>
          ) : (
            <>
              <strong>{t("Current Club")}:</strong>
              <span> {clubCareer.current_club || t("N/A")}</span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <>
              <span>{formatDate(clubCareer.professional_debut)}</span>
              <strong> :{t("Professional Debut")}</strong>
            </>
          ) : (
            <>
              <strong>{t("Professional Debut")}:</strong>
              <span> {formatDate(clubCareer.professional_debut)}</span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <>
              <span>{clubCareer.previous_clubs || t("No previous clubs")}</span>
              <strong> :{t("Previous Clubs")}</strong>
            </>
          ) : (
            <>
              <strong>{t("Previous Clubs")}:</strong>
              <span> {clubCareer.previous_clubs || t("No previous clubs")}</span>
            </>
          )}
        </li>
      </ul>
    </div>
  );
}