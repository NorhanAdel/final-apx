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
export default function NewestPlayers({ sportId }: NewestPlayersProps) {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";
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

  if (loading) {
    return (
      <div className="mt-14 px-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-center py-20">
          <div className="relative inline-flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            <span className="text-xs font-black text-yellow-400 tracking-widest uppercase">
              {t("loading")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (players.length === 0) return null;

  return (
    <div className="mt-14 px-3 sm:px-6 lg:px-10">
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
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
            {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </motion.button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{ nextEl: ".nextPlayer", prevEl: ".prevPlayer" }}
        dir={isRTL ? "rtl" : "ltr"}
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
              whileHover={{ y: -8 }}
              transition={{ duration: 0.4 }}
              onClick={() => (window.location.href = `/players/${player.id}`)}
              className={`group overflow-hidden rounded-[28px] cursor-pointer border relative h-[430px]
              ${
                isDark
                  ? "bg-[#0b1120] border-[#1e293b]"
                  : "bg-white border-gray-200 shadow-lg"
              }`}
            >
              <div className="absolute inset-0">
                <Image
                  src={getFullImageUrl(player.photos?.[0]?.image_url || "")}
                  alt={player.first_name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>

              {player.super7_score && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="w-14 h-14 rounded-full bg-yellow-400 text-black flex flex-col items-center justify-center shadow-xl">
                    <span className="text-[10px] font-bold">S7</span>
                    <span className="text-lg font-black">
                      {player.super7_score}
                    </span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 w-full z-20 p-5">
                <div className="mb-3">{renderStars(player.average_rating || 0)}</div>
                <h3 className="text-2xl font-bold text-white line-clamp-1">
                  {player.first_name} {player.last_name}
                </h3>
                <div className="flex items-center gap-2 text-gray-300 mt-2 text-sm">
                  <LocateFixed size={14} className="text-yellow-400" />
                  {player.nationality || t("Unknown")}
                </div>
                <div className="flex items-center justify-between mt-5">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                    <div className="text-xs text-gray-300">{t("Age")}</div>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <User size={14} className="text-yellow-400" />
                      {player.age || 0}
                      {t("Y")}
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-yellow-500/15 border border-yellow-500/30">
                    <div className="text-xs text-yellow-300">{t("Level")}</div>
                    <div className="text-white font-bold">
                      {player.super7_level || "-"}
                    </div>
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