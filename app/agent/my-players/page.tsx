"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PlayerCard } from "@/app/components/PlayerCard";
import { GET_MY_PLAYERS } from "@/app/graphql/query/request.queries";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import BackButton from "@/app/components/BackButton";

interface Player {
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
  super7Score: number;
}

interface MyPlayersResponse {
  myPlayers: Player[];
}

export default function AgentMyPlayers() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";
  const [mounted, setMounted] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMyPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<MyPlayersResponse>(GET_MY_PLAYERS, {});
      if (result.data?.myPlayers) {
        const uniquePlayers = result.data.myPlayers.filter(
          (player, index, self) =>
            index === self.findIndex((p) => p.id === player.id)
        );
        setPlayers(uniquePlayers);
        setFilteredPlayers(uniquePlayers);
      }
    } catch (error) {
      console.error("Error fetching my players:", error);
      toast.error(t("Failed to load players"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMyPlayers();
  }, [fetchMyPlayers]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(
        (player) =>
          player.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.last_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredPlayers(filtered);
    }
  }, [searchTerm, players]);

  const getFullImageUrl = (url: string) => {
    if (!url) return "/placeholder-player.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
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

  const handlePlayerClick = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };

  const getPlayerFullName = (player: Player) => {
    return `${player.first_name} ${player.last_name}`;
  };

  // استخدام قيم ثابتة أثناء التحميل الأولي
  const dirValue = mounted ? (isRTL ? "rtl" : "ltr") : "ltr";
  const textAlignClass = mounted ? (isRTL ? "text-right" : "text-left") : "text-left";
  const searchIconPosition = mounted ? (isRTL ? "right-3" : "left-3") : "left-3";
  const searchInputPadding = mounted ? (isRTL ? "pr-10 pl-4" : "pl-10 pr-4") : "pl-10 pr-4";
  const searchInputTextAlign = mounted ? (isRTL ? "text-right" : "text-left") : "text-left";

  return (
    <div
      className={`min-h-screen py-40 px-6 transition ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
      dir={dirValue}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`flex justify-between items-center mb-10 ${mounted && isRTL ? "flex-row-reverse" : ""}`}>
          <BackButton className="mb-6" />

          <h1
            className={`text-4xl font-black italic tracking-tighter text-yellow-400 uppercase ${textAlignClass}`}
          >
            {t("My Players")}
          </h1>

          <div className="relative">
            <Search
              size={20}
              className={`absolute top-1/2 transform -translate-y-1/2 ${searchIconPosition} text-gray-400`}
            />
            <input
              type="text"
              placeholder={t("Search players...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${searchInputPadding} py-2 rounded-lg outline-none border w-64 ${
                isDark
                  ? "bg-[#0a0f2c] border-[#1e2a5a] text-white placeholder-gray-500 focus:border-yellow-400"
                  : "bg-white border-gray-300 text-black placeholder-gray-400 focus:border-yellow-400"
              } ${searchInputTextAlign}`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-yellow-500" />
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div
            className={`text-center py-20 rounded-xl ${
              isDark ? "bg-[#0a1128]" : "bg-white shadow"
            } ${textAlignClass}`}
          >
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-500" />
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              {searchTerm
                ? t("No players found")
                : t("No players accepted your requests yet")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player, index) => (
              <div
                key={`${player.id}-${index}`}
                onClick={() => handlePlayerClick(player.id)}
                className="cursor-pointer"
              >
                <PlayerCard
                  name={getPlayerFullName(player)}
                  image={getFullImageUrl(player.profile_image_url)}
                  rating={player.average_rating || 0}
                  position={player.position || "Forward"}
                  country={getCountryName(player.nationality)}
                  age={player.age || 0}
                  super7Score={player.super7Score || 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}