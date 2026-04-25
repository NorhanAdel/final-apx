"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_ALL_POSITIONS } from "../graphql/query/sportPositions.query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Sport {
  id: string;
  name: string;
  image_url?: string;
}

interface Position {
  id: string;
  name: string;
  category?: string;
  sport?: Sport;
}

export default function PositionSlider() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const pathname = usePathname();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSportId, setCurrentSportId] = useState<string | null>(null);

  const isRTL = lang === "ar";

  // Get sport ID from URL path by fetching from backend
  useEffect(() => {
    const sportSlug = pathname.split("/")[1];

    if (
      sportSlug &&
      sportSlug !== "players" &&
      sportSlug !== "profile" &&
      sportSlug !== "blog" &&
      sportSlug !== "events" &&
      sportSlug !== "championships" &&
      sportSlug !== "reels"
    ) {
      const fetchSportId = async () => {
        try {
          const result = await fetchGraphQL<{ sports: Sport[] }>(
            `query GetSports {
              sports {
                id
                name
              }
            }`,
            {}
          );
          
          if (result.data?.sports) {
            const sport = result.data.sports.find(
              (s) => s.name.toLowerCase() === sportSlug.toLowerCase()
            );
            if (sport) {
              setCurrentSportId(sport.id);
            } else {
              setCurrentSportId(null);
            }
          }
        } catch (error) {
          console.error("Error fetching sport:", error);
          setCurrentSportId(null);
        }
      };
      fetchSportId();
    } else {
      setCurrentSportId(null);
    }
  }, [pathname]);

  // Fetch positions directly from backend with sportId filter
  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      try {
        // Pass sportId directly to the backend query
        const variables = currentSportId ? { sportId: currentSportId } : {};
        const result = await fetchGraphQL<{ sportPositions: Position[] }>(
          GET_ALL_POSITIONS,
          variables,
        );

        if (!result.data?.sportPositions) {
          setPositions([]);
          return;
        }

        setPositions(result.data.sportPositions);
      } catch (err) {
        console.error("Error fetching positions:", err);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [lang, currentSportId]);

  if (loading) {
    return (
      <div className="mt-14 px-3 sm:px-6 lg:px-10">
        <p className="text-center text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  if (positions.length === 0) {
    return null;
  }

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
          {t("position")}
        </motion.h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`prevPosition w-9 h-9 flex items-center justify-center border rounded-md transition ${
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
            className={`nextPosition w-9 h-9 flex items-center justify-center border rounded-md transition ${
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
        navigation={{ nextEl: ".nextPosition", prevEl: ".prevPosition" }}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
      >
        {positions.map((position) => (
          <SwiperSlide key={position.id}>
            <Link
              href={
                currentSportId
                  ? `/players?sport=${currentSportId}&position=${position.id}`
                  : "/players"
              }
              className="block"
            >
              <div
                className={`h-[140px] sm:h-[150px] md:h-[160px] rounded-xl overflow-hidden transition cursor-pointer
                ${
                  theme === "dark"
                    ? "bg-[#0b1120] hover:border-yellow-400/50"
                    : "bg-white shadow-md border hover:border-yellow-400"
                }`}
              >
                <div className="flex h-full">
                  <div className="relative w-1/2 h-full">
                    <Image
                      src={
                        position.sport?.image_url
                          ? position.sport.image_url.startsWith("http")
                            ? position.sport.image_url
                            : `${API_URL}${position.sport.image_url}`
                          : "/p1.png"
                      }
                      alt={position.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
                  </div>

                  <div
                    className={`w-1/2 flex flex-col justify-center px-4 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <h3
                      className={`text-base sm:text-lg md:text-xl font-bold italic
                      ${theme === "dark" ? "text-white" : "text-black"}`}
                    >
                      {position.name}
                    </h3>

                    {position.category && (
                      <span
                        className={`text-xs mt-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {position.category}
                      </span>
                    )}

                    <div className="mt-3">
                      <span
                        className={`text-xs font-semibold ${
                          theme === "dark"
                            ? "text-yellow-400"
                            : "text-[#F0B100]"
                        }`}
                      >
                        {position.sport?.name || t("sport")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}