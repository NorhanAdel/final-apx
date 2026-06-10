"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { useTheme } from "../context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  views_count?: number;
  created_at?: string;
}

export default function AdsCarousel() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";

  const router = useRouter();

  const [ads, setAds] = useState<Ad[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchAds();
  }, [lang]);

  const fetchAds = async () => {
    const query = `
      query {
        activeAds {
          id
          title
          description
          image_url
          views_count
          created_at
        }
      }
    `;

    const res = await fetchGraphQL<{ activeAds: Ad[] }>(query, {});
    if (!res.data?.activeAds) return;

    const formatted = res.data.activeAds.map((ad) => ({
      ...ad,
      image_url: ad.image_url?.startsWith("http")
        ? ad.image_url
        : `${API_URL}${ad.image_url}`,
    }));

    setAds(formatted);
  };

  const next = () => setIndex((prev) => (prev + 1) % ads.length);
  const prev = () => setIndex((prev) => (prev - 1 + ads.length) % ads.length);

  const getPosition = (i: number) => {
    const diff = i - index;
    if (diff === 0) return "center";
    if (diff === 1 || diff === -(ads.length - 1)) return "right";
    if (diff === -1 || diff === ads.length - 1) return "left";
    return "hidden";
  };

  if (ads.length === 0) return null;

  return (
    <section className="mt-14 px-6">
      {/* Title */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
          {t("ad")}
        </h2>
      </div>

      {/* 3D Carousel */}
      <div className="relative h-[420px] flex items-center justify-center overflow-hidden">
        {ads.map((ad, i) => {
          const position = getPosition(i);

          return (
            <motion.div
              key={ad.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x < -100) next();
                if (info.offset.x > 100) prev();
              }}
              animate={{
                x:
                  position === "center"
                    ? 0
                    : position === "left"
                    ? -280
                    : position === "right"
                    ? 280
                    : 0,
                scale:
                  position === "center"
                    ? 1
                    : position === "hidden"
                    ? 0.7
                    : 0.85,
                opacity:
                  position === "center"
                    ? 1
                    : position === "hidden"
                    ? 0
                    : 0.5,
                zIndex: position === "center" ? 10 : 1,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="absolute cursor-grab active:cursor-grabbing"
              onClick={() => router.push(`/ad/${ad.id}`)}
            >
              <div
                className={`w-[280px] h-[400px] md:w-[340px] md:h-[420px] rounded-2xl overflow-hidden shadow-2xl relative group ${
                  position === "center"
                    ? "ring-1 ring-[#F0B100]/20 shadow-[0_0_40px_rgba(240,177,0,0.1)]"
                    : ""
                }`}
              >
                {/* Image */}
                {ad.image_url && (
                  <Image
                    src={ad.image_url}
                    alt={ad.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-500" />

                {/* Views badge */}
                {ad.views_count !== undefined && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white/90 text-xs px-3 py-1.5 rounded-full border border-white/10">
                    <Eye size={12} />
                    <span>{ad.views_count}</span>
                  </div>
                )}

                {/* Bottom content */}
                <div className="absolute bottom-0 w-full px-5 pb-5 pt-16 bg-gradient-to-t from-black/70 to-transparent">
                  {/* Date */}
                  <p className="text-sm text-white/60 mb-1.5">
                    {ad.created_at
                      ? new Date(ad.created_at).toLocaleDateString(lang)
                      : ""}
                  </p>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white truncate">
                    {ad.title}
                  </h3>

                  {/* Description */}
                  {ad.description && (
                    <p className="text-xs text-gray-300/80 line-clamp-2 mt-1.5 leading-relaxed">
                      {ad.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          className="
            absolute left-2 md:left-5 
            top-1/2 -translate-y-1/2 
            z-20 
            px-3 py-2 md:px-4 md:py-3
            rounded-xl
            bg-black/30 backdrop-blur-md
            text-white
            border border-white/10
            hover:bg-black/50 hover:scale-105
            transition-all duration-200
          "
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={next}
          className="
            absolute right-2 md:right-5 
            top-1/2 -translate-y-1/2 
            z-20 
            px-3 py-2 md:px-4 md:py-3
            rounded-xl
            bg-black/30 backdrop-blur-md
            text-white
            border border-white/10
            hover:bg-black/50 hover:scale-105
            transition-all duration-200
          "
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </section>
  );
}
