"use client";

import { useEffect, useState } from "react";
import {
  LocateFixed,
  Star,
  StarHalf,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_PLAYERS_BY_SPORT } from "@/app/graphql/query/player.queries";

 
interface NewestPlayersProps {
  sportId: string;
}
interface Player {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  email_address?: string;
  phone?: string;
  nationality?: string;
  country?: string;
  city?: string;
  height_cm?: number;
  weight_kg?: number;
  date_of_birth?: string;
  age?: number;
  average_rating?: number;
  super7_level?: string;    
  super7_score?: number;    
  photos?: {
    image_url: string;
  }[];
}
export default function NewestPlayers({
  sportId,
}: NewestPlayersProps) {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (sportId) {
    fetchPlayers();
  }
}, [sportId]);

const fetchPlayers = async () => {
  try {
    setLoading(true);

    const result = await fetchGraphQL<{
      playersBySport: {
        data: Player[];
        total: number;
      };
    }>(GET_PLAYERS_BY_SPORT, {
      sportId,
    });

    console.log("sportId:", sportId);
    console.log("PLAYERS RESPONSE:", result);

    if (result.data?.playersBySport?.data) {
      setPlayers(result.data.playersBySport.data);
    } else {
      setPlayers([]);
    }
  } catch (error) {
    console.error("Error fetching players:", error);
    setPlayers([]);
  } finally {
    setLoading(false);
  }
};
  const getFullImageUrl = (url: string) => {
    if (!url) return "/b2.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  // Function to render 7 stars based on rating (0-7 scale)
  const renderStars = (rating: number = 0) => {
    const maxStars = 7;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={12}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <StarHalf size={12} className="fill-yellow-400 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={12} className="text-gray-500" />
        ))}
      </div>
    );
  };

  if (loading || players.length === 0) return null;

  return (
    <div className="mt-14 px-3 sm:px-6 lg:px-10">
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className={`text-lg sm:text-2xl font-bold italic tracking-wide ${
            isDark ? "text-white" : "text-[#F0B100]"
          }`}
        >
          {t("Newest Players")}
        </motion.h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`prevPlayer w-9 h-9 flex items-center justify-center border rounded-md transition ${
              isDark
                ? "bg-[#0b1120] border-[#1e293b] text-white"
                : "bg-gray-200 border-gray-300 text-black"
            }`}
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`nextPlayer w-9 h-9 flex items-center justify-center border rounded-md transition ${
              isDark
                ? "bg-[#0b1120] border-[#1e293b] text-white"
                : "bg-gray-200 border-gray-300 text-black"
            }`}
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{ nextEl: ".nextPlayer", prevEl: ".prevPlayer" }}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
      >
       {players.map((player) => (
  <SwiperSlide key={player.id}>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, y: -8 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl overflow-hidden border shadow-lg transition-all cursor-pointer relative ${
        isDark
          ? "bg-[#0b1120] border-[#1e293b]"
          : "bg-white border-gray-200"
      }`}
      onClick={() => (window.location.href = `/players/${player.id}`)}
    >
      {/* Image */}
      <div className="relative w-full h-[220px] sm:h-[250px] overflow-hidden">
        <Image
          src={getFullImageUrl(player.photos?.[0]?.image_url || "")}
          alt={player.first_name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* ⭐ Super7 Score Badge */}
        {player.super7_score !== undefined && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-yellow-500/90 text-black text-xs font-bold shadow-md">
            🏆 {player.super7_score}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Rating */}
        <div className="flex justify-between items-center mb-3">
          <h3
            className={`text-base sm:text-lg font-bold truncate ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            {player.first_name} {player.last_name}
          </h3>

          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }}>
            {renderStars(player.average_rating || 0)}
          </motion.div>
        </div>

        {/* Info */}
        <div
          className={`flex flex-col gap-2 text-xs ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {/* Nationality */}
          <div className="flex justify-between items-center">
            <span>{t("Player")}</span>
            <span className="flex items-center">
              <LocateFixed size={12} className="text-yellow-500 mr-1" />
              {player.nationality || t("Unknown")}
            </span>
          </div>

          {/* Age + Super7 inline */}
          <div className="flex justify-between items-center">
            <span className="flex items-center text-yellow-500">
              <User size={12} className="mr-1" />
              {player.age || 0}Y
            </span>

            {player.super7_score && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[13px] font-semibold border border-yellow-500/30">
             S7Score   : {player.super7_score}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  </SwiperSlide>
))}
      </Swiper>
    </div>
  );
}
