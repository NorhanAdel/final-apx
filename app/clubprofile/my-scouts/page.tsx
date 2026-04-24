"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Eye, Trophy, MapPin, User, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
import { toast } from "sonner";

interface Scout {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  nationality: string;
  country: string;
  city: string;
  profile_image_url: string;
  request_id?: string;
  created_at?: string;
}

const GET_MY_SCOUTS = `
  query MyScouts {
    myScouts {
      id
      user_id
      first_name
      last_name
      nationality
      country
      city
      profile_image_url
    }
  }
`;

const ScoutCard = ({
  name,
  image,
  country,
  city,
  nationality,
  isDark,
  t,
}: {
  name: string;
  image: string;
  country: string;
  city: string;
  nationality: string;
  isDark: boolean;
  t: (key: string) => string;
}) => {
  const bgColor = isDark ? "bg-[#030712]" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
  const borderColor = isDark ? "border-white/5" : "border-gray-200";
  const hoverBorderColor = isDark
    ? "hover:border-[#eab308]/30"
    : "hover:border-yellow-400/50";
  const gradientFrom = isDark ? "from-[#030712]" : "from-white";

  return (
    <div
      className={`relative group overflow-hidden rounded-xl ${bgColor} border ${borderColor} shadow-lg transition-all duration-300 ${hoverBorderColor}`}
    >
      <div className="relative aspect-[4/5] w-full bg-[#c2a33e]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-top grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400/20 to-transparent">
            <Eye size={48} className="text-yellow-500/50" />
          </div>
        )}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${gradientFrom} via-transparent to-transparent opacity-90`}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`text-2xl font-black italic uppercase tracking-tighter ${textColor}`}
          >
            {name}
          </h3>
        </div>

        <div
          className={`flex items-center justify-between text-[10px] font-bold italic ${textSecondary}`}
        >
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-[#eab308]" />
            <span>{t("Scout")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#eab308]" />
            <span>{country}, {city}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-[#eab308]" />
            <span>{nationality}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MyScoutsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const [scouts, setScouts] = useState<Scout[]>([]);
  const [filteredScouts, setFilteredScouts] = useState<Scout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMyScouts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ myScouts: Scout[] }>(
        GET_MY_SCOUTS,
        {}
      );
      if (result.data?.myScouts) {
        setScouts(result.data.myScouts);
        setFilteredScouts(result.data.myScouts);
      } else {
        setScouts([]);
        setFilteredScouts([]);
      }
    } catch (error) {
      console.error("Error fetching scouts:", error);
      toast.error(t("Failed to load scouts"));
      setScouts([]);
      setFilteredScouts([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMyScouts();
  }, [fetchMyScouts]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredScouts(scouts);
    } else {
      const filtered = scouts.filter(
        (scout) =>
          scout.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scout.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scout.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scout.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredScouts(filtered);
    }
  }, [searchTerm, scouts]);

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const handleScoutClick = (scoutId: string) => {
    router.push(`/scout/${scoutId}`);
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
            {t("My Scouts")}
          </h1>

          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={t("Search scouts...")}
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
            <Loader2 size={40} className="animate-spin text-yellow-500" />
          </div>
        ) : filteredScouts.length === 0 ? (
          <div
            className={`text-center py-20 rounded-xl ${
              isDark ? "bg-[#0a1128]" : "bg-white shadow"
            }`}
          >
            <Eye size={48} className="mx-auto mb-4 text-gray-500" />
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              {searchTerm
                ? t("No scouts found")
                : t("No scouts added to your club yet")}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={`mt-4 px-4 py-2 rounded-md transition ${
                  isDark
                    ? "bg-yellow-400 text-black hover:bg-yellow-500"
                    : "bg-[#F0B100] text-black hover:bg-yellow-500"
                }`}
              >
                {t("Clear search")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScouts.map((scout) => (
              <div
                key={scout.id}
                onClick={() => handleScoutClick(scout.id)}
                className="cursor-pointer"
              >
                <ScoutCard
                  name={`${scout.first_name} ${scout.last_name}`}
                  image={getFullImageUrl(scout.profile_image_url)}
                  country={scout.country}
                  city={scout.city}
                  nationality={scout.nationality}
                  isDark={isDark}
                  t={t}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}