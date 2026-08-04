"use client";

import { useEffect, useState } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import {
  GET_PLAYER_CLUB_CAREER,
  GET_PROFESSIONAL_DEBUT_OPTIONS,
} from "@/app/graphql/query/player.queries";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";

interface ClubCareerData {
  id: string;
  current_club?: string | null;
  professional_debut?: string | null;
  previous_clubs?: string | null;
}

interface OptionItem {
  value: string;
  label: string;
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
  const [professionalDebutOptions, setProfessionalDebutOptions] = useState<
    OptionItem[]
  >([]);
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

  // Fetch backend-translated labels for professional debut (years of experience),
  // same source of truth used in the edit form (GET_PROFESSIONAL_DEBUT_OPTIONS)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const result = await fetchGraphQL<{
          getProfessionalDebutOptions: OptionItem[];
        }>(GET_PROFESSIONAL_DEBUT_OPTIONS, { lang });
        if (result.data?.getProfessionalDebutOptions) {
          setProfessionalDebutOptions(result.data.getProfessionalDebutOptions);
        }
      } catch (err) {
        console.error("Error fetching professional debut options:", err);
      }
    };
    fetchOptions();
  }, [lang]);

  // Look up the human-readable, backend-translated label for a professional debut code
  // (e.g. "1_TO_3" -> "من 1 إلى 3 سنوات (خبرة متوسطة)")
  const formatProfessionalDebut = (debut?: string | null) => {
    if (!debut) return t("N/A");
    const code = debut.trim().toUpperCase();
    const match = professionalDebutOptions.find(
      (o) => o.value.toUpperCase() === code,
    );
    return match?.label || debut;
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
            <span>
              <strong>{t("Current Club")}: </strong>
              {clubCareer.current_club || t("N/A")}
            </span>
          ) : (
            <>
              <strong>{t("Current Club")}:</strong>
              <span> {clubCareer.current_club || t("N/A")}</span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <span>
              <strong>{t("Years of Experience")}: </strong>
              {formatProfessionalDebut(clubCareer.professional_debut)}
            </span>
          ) : (
            <>
              <strong>{t("Years of Experience")}:</strong>
              <span> {formatProfessionalDebut(clubCareer.professional_debut)}</span>
            </>
          )}
        </li>
        <li className={textColor}>
          {isRTL ? (
            <span>
              <strong>{t("Previous Clubs")}: </strong>
              {clubCareer.previous_clubs || t("No previous clubs")}
            </span>
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