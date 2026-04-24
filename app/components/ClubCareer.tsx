"use client";

import { useEffect, useState } from "react";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { GET_PLAYER_CLUB_CAREER } from "@/app/graphql/query/player.queries";
import { useTheme } from "@/app/context/ThemeContext";

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
  const isDark = theme === "dark";
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
          setError("Failed to load club career.");
          return;
        }

        setClubCareer(result.data?.playerClubCareer || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load club career.");
      } finally {
        setLoading(false);
      }
    };

    fetchClubCareer();
  }, [playerId]);

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const textColor = isDark ? "text-gray-300" : "text-gray-700";
  const secondaryTextColor = isDark ? "text-gray-400" : "text-gray-500";

  if (loading)
    return (
      <div className="mt-8 text-left">
        <h3 className="text-yellow-400 font-semibold mb-3">Club Career</h3>
        <p className={`${secondaryTextColor} text-center mt-4`}>
          Loading club career...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="mt-8 text-left">
        <h3 className="text-yellow-400 font-semibold mb-3">Club Career</h3>
        <p className="text-red-500 text-center mt-4">{error}</p>
      </div>
    );

  if (!clubCareer)
    return (
      <div className="mt-8 text-left">
        <h3 className="text-yellow-400 font-semibold mb-3">Club Career</h3>
        <p className={`${secondaryTextColor} text-center mt-4`}>
          No club career information available.
        </p>
      </div>
    );

  return (
    <div className="mt-8 text-left">
      <h3 className="text-yellow-400 font-semibold mb-3">Club Career</h3>
      <ul className="space-y-2 text-sm">
        <li className={textColor}>
          <strong>Current Club:</strong> {clubCareer.current_club || "N/A"}
        </li>
        <li className={textColor}>
          <strong>Professional Debut:</strong>{" "}
          {formatDate(clubCareer.professional_debut)}
        </li>
        <li className={textColor}>
          <strong>Previous Clubs:</strong>
          <p className={`mt-1 ${secondaryTextColor}`}>
            {clubCareer.previous_clubs || "No previous clubs"}
          </p>
        </li>
      </ul>
    </div>
  );
}
