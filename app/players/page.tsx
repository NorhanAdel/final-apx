// app/players/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { PlayerCard } from "../components/PlayerCard";
import Link from "next/link";
import { useTheme } from "@/app/context/ThemeContext";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import {
  GET_ALL_PLAYERS,
  SEARCH_PLAYERS,
} from "@/app/graphql/query/player.queries";
import useTranslate from "../hooks/useTranslate";

interface PlayerData {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  nationality?: string;
  date_of_birth?: string;
  age?: number;
  average_rating?: number;
  trust_level?: string;
}

interface FormattedPlayer {
  id: string;
  name: string;
  image: string;
  rating: number;
  position: string;
  country: string;
  age: number;
}

interface GetAllPlayersResponse {
  getAllPlayers: {
    data: PlayerData[];
    total: number;
  };
}

interface SearchPlayersResponse {
  searchPlayers: {
    data: PlayerData[];
    total: number;
  };
}

export default function PlayersPage() {
  const { theme } = useTheme();
  const { lang, t } = useTranslate();
  const isDark = theme === "dark";

  const [players, setPlayers] = useState<FormattedPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minAge, setMinAge] = useState<string>("");
  const [maxAge, setMaxAge] = useState<string>("");
  const [activeSort, setActiveSort] = useState<
    "newest" | "highest_rated" | "age" | "name"
  >("newest");

  const getSortByValue = useCallback(() => {
    if (activeSort === "highest_rated") return "highest_rated";
    if (activeSort === "age") return "age";
    if (activeSort === "name") return "name";
    return "newest";
  }, [activeSort]);

const fetchPlayers = useCallback(async () => {
  setLoading(true);
  try {
    let playerData: PlayerData[] = [];
    const sortByValue = getSortByValue();
    const minAgeNum = minAge ? parseInt(minAge) : undefined;
    const maxAgeNum = maxAge ? parseInt(maxAge) : undefined;

    if (searchTerm.trim()) {
      const result = await fetchGraphQL<SearchPlayersResponse>(SEARCH_PLAYERS, {
        query: searchTerm,
        skip: 0,
        take: 50,
        sortBy: sortByValue,
        minAge: minAgeNum,
        maxAge: maxAgeNum,
      });
      playerData = result?.data?.searchPlayers?.data || [];
    } else {
      const result = await fetchGraphQL<GetAllPlayersResponse>(
        GET_ALL_PLAYERS,
        {
          skip: 0,
          take: 50,
          sortBy: sortByValue,
          minAge: minAgeNum,
          maxAge: maxAgeNum,
        },
      );
      playerData = result?.data?.getAllPlayers?.data || [];
    }

    if (!playerData || playerData.length === 0) {
      setPlayers([]);
      return;
    }

    let formatted = playerData.map((p: PlayerData) => {
      const rating = p.average_rating ?? 0;

      let image = "/b2.jpg";
      if (p.profile_image_url) {
        image = p.profile_image_url.startsWith("http")
          ? p.profile_image_url
          : `${process.env.NEXT_PUBLIC_API_URL}${p.profile_image_url}`;
      }

      return {
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        image,
        rating: rating,
        position: "Player",
        country: p.nationality || "Unknown",
        age: p.age || 0,
      };
    });

    if (activeSort === "name") {
      formatted = formatted.sort((a, b) => a.name.localeCompare(b.name));
    }

    setPlayers(formatted);
  } catch (err) {
    console.error(err);
    setPlayers([]);
  } finally {
    setLoading(false);
  }
}, [searchTerm, activeSort, getSortByValue, minAge, maxAge]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers, lang]);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const bg = isDark ? "bg-[#01040a]" : "bg-gray-100";
  const text = isDark ? "text-white" : "text-black";
  const card = isDark ? "bg-[#030816]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-gray-300";
  const accent = isDark ? "text-[#eab308]" : "text-yellow-600";

  return (
    <div
      className={`min-h-screen py-30 px-4 sm:px-6 md:px-8 pb-10 ${bg} ${text}`}
    >
      <div className="max-w-7xl mx-auto pt-20 sm:pt-24 md:pt-28 mb-8 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${accent}/60`}
            size={18}
          />
          <input
            type="text"
            placeholder={t("Search players by name...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-lg py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm italic font-bold border focus:outline-none transition ${card} ${border} ${accent} focus:border-yellow-500/50`}
          />
        </div>

        {/* Age Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-xs font-bold italic ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {t("Age Range:")}
          </span>
          <input
            type="number"
            placeholder={t("Min Age")}
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            className={`w-24 rounded-lg py-2 px-3 text-xs border focus:outline-none transition ${card} ${border} ${accent} focus:border-yellow-500/50`}
          />
          <span
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            -
          </span>
          <input
            type="number"
            placeholder={t("Max Age")}
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            className={`w-24 rounded-lg py-2 px-3 text-xs border focus:outline-none transition ${card} ${border} ${accent} focus:border-yellow-500/50`}
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveSort("newest")}
            className={`px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold border transition ${card} ${border} hover:opacity-80 ${
              activeSort === "newest" ? "border-yellow-400 text-yellow-400" : ""
            }`}
          >
            {t("Newest")}
          </button>

          <button
            onClick={() => setActiveSort("highest_rated")}
            className={`px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold border transition ${card} ${border} hover:opacity-80 ${
              activeSort === "highest_rated"
                ? "border-yellow-400 text-yellow-400"
                : ""
            }`}
          >
            {t("Highest Rated")}
          </button>

          <button
            onClick={() => setActiveSort("age")}
            className={`px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold border transition ${card} ${border} hover:opacity-80 ${
              activeSort === "age" ? "border-yellow-400 text-yellow-400" : ""
            }`}
          >
            {t("Age")}
          </button>

          <button
            onClick={() => setActiveSort("name")}
            className={`px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold border transition ${card} ${border} hover:opacity-80 ${
              activeSort === "name" ? "border-yellow-400 text-yellow-400" : ""
            }`}
          >
            {t("Name")}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {loading ? (
          <p className="col-span-full text-center opacity-70">
            {t("Loading...")}
          </p>
        ) : filteredPlayers.length === 0 ? (
          <p className="col-span-full text-center opacity-70">
            {t("No players found")}
          </p>
        ) : (
          filteredPlayers.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <div className="cursor-pointer">
                <PlayerCard {...player} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
