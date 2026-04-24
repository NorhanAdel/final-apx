"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { toast } from "sonner";
import { PlayerCard } from "@/app/components/PlayerCard";
import { GET_INCOMING_PLAYERS } from '@/app/graphql/query/transfer.queries';

interface IncomingPlayer {
  player: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
    nationality: string;
    profile_image_url: string;
    average_rating: number;
    total_ratings: number;
    date_of_birth: string;
    age: number;
  };
}

export default function MyPlayersPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const [players, setPlayers] = useState<IncomingPlayer[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<IncomingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchIncomingPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ incomingPlayers: IncomingPlayer[] }>(
        GET_INCOMING_PLAYERS,
        {},
      );
      console.log("Response:", result);
      if (
        result.data?.incomingPlayers &&
        result.data.incomingPlayers.length > 0
      ) {
        setPlayers(result.data.incomingPlayers);
        setFilteredPlayers(result.data.incomingPlayers);
      } else {
        console.log("No incoming players found");
      }
    } catch (error) {
      console.error("Error fetching incoming players:", error);
      toast.error(t("Failed to load players"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchIncomingPlayers();
  }, [fetchIncomingPlayers]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(
        (item) =>
          item.player?.first_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.player?.last_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredPlayers(filtered);
    }
  }, [searchTerm, players]);

  const handlePlayerClick = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };

  const getCountryName = (nationality: string): string => {
    const countryMap: Record<string, string> = {
      Brazil: "Brazil",
      Egypt: "Egypt",
      "Saudi Arabia": "Saudi Arabia",
      UAE: "UAE",
      Qatar: "Qatar",
      Argentina: "Argentina",
      Portugal: "Portugal",
      France: "France",
      Spain: "Spain",
      Germany: "Germany",
      Italy: "Italy",
      England: "England",
      Morocco: "Morocco",
      Tunisia: "Tunisia",
      Algeria: "Algeria",
    };
    return countryMap[nationality] || nationality || "Unknown";
  };

  const getPlayerFullName = (player: IncomingPlayer["player"]) => {
    if (player.first_name && player.last_name) {
      return `${player.first_name} ${player.last_name}`;
    }
    return player.first_name || player.last_name || "Unknown";
  };

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder-player.jpg";
    if (url.startsWith("http")) return url;
    // أضف base URL من الـ environment variables
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    return `${baseUrl}${url}`;
  };

  return (
    <div
      className={`min-h-screen py-20 px-6 transition ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-yellow-400 uppercase">
            {t("My Players")}
          </h1>
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={t("Search players...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg outline-none border w-64 ${
                isDark
                  ? "bg-[#0a0f2c] border-[#1e2a5a] text-white placeholder-gray-500 focus:border-yellow-400"
                  : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-yellow-400"
              }`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div
            className={`text-center py-20 rounded-xl ${
              isDark ? "bg-[#0a1128]" : "bg-white shadow"
            }`}
          >
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-500" />
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              {searchTerm
                ? t("No players found")
                : t("No players transferred to your club yet")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((item, index) => (
              <div
                key={item.player?.id || index}
                onClick={() => handlePlayerClick(item.player.id)}
                className="cursor-pointer"
              >
                <PlayerCard
                  name={getPlayerFullName(item.player)}
                  image={getImageUrl(item.player?.profile_image_url)}
                  rating={item.player?.average_rating || 0}
                  position={item.player?.position || "Forward"}
                  country={getCountryName(item.player?.nationality)}
                  age={item.player?.age || 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
