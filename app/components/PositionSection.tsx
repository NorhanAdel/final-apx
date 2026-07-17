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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Sport {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
  category?: string;
  image_url?: string;
  sport?: Sport;
}

export default function PositionSlider({
  sportId,
}: {
  sportId?: string;
}) {
  const { theme } = useTheme();
  const { t } = useTranslate();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    if (!sportId) return;

    const fetchPositions = async () => {
      setLoading(true);

      const query = `
        query GetPositionsBySport($sportId: ID!) {
          positionsBySport(sportId: $sportId) {
            id
            name
            category
            image_url
            sport {
              id
              name
              image_url
            }
          }
        }
      `;

      try {
        const result = await fetchGraphQL<{
          positionsBySport: Position[];
        }>(query, { sportId });

        setPositions(result.data?.positionsBySport || []);
      } catch (err) {
        console.error(err);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [sportId]);

  if (loading) {
    return (
      <div className="mt-14 px-6 text-center text-gray-400">
        {t("loading")}
      </div>
    );
  }

  if (!positions.length) return null;

  return (
    <div className="mt-14 px-3 lg:px-10">
      <div className="flex justify-between items-center mb-6">
        <motion.h2
          className={`text-xl font-bold ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          {t("position")}
        </motion.h2>

        <div className="flex gap-2">
          <button className="prevPosition w-9 h-9 border rounded flex items-center justify-center">
            <ChevronLeft size={16} />
          </button>

          <button className="nextPosition w-9 h-9 border rounded flex items-center justify-center">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{
          nextEl: ".nextPosition",
          prevEl: ".prevPosition",
        }}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {positions.map((pos) => (
<SwiperSlide key={pos.id}>
  <Link
    href={`/players?sport=${sportId}&position=${pos.id}`}
    className="block group"
  >
    <div className="relative h-[220px] rounded-[28px] overflow-hidden shadow-xl border border-white/10">

      {/* Background Image */}
      <Image
        src={
          pos.image_url
            ? pos.image_url.startsWith("http")
              ? pos.image_url
              : `${API_URL}${pos.image_url}`
            : "/p1.png"
        }
        alt={pos.name}
        fill
        className="object-cover transition duration-700 group-hover:scale-110"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />

      {/* Content */}
      <div className="relative z-10 h-full p-6 flex flex-col justify-between">

        <div>
          {pos.category && (
            <span className="inline-flex px-3 py-1 rounded-full bg-yellow-400/20 backdrop-blur-md text-yellow-300 text-xs font-semibold border border-yellow-400/20">
              {pos.category}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
            {pos.name}
          </h3>

          <p className="text-gray-300 text-sm mb-4">
            {pos.sport?.name}
          </p>

          <div className="flex items-center gap-2 text-yellow-400 font-medium text-sm">
            {t("View Players")}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
        <div className="absolute inset-0 border border-yellow-400/30 rounded-[28px]" />
      </div>
    </div>
  </Link>
</SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
