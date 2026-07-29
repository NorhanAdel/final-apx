"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const isRTL = lang === "ar";

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetchAds();
  }, [lang]);

  const fetchAds = async () => {
    setLoading(true);
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

    if (!res.data?.activeAds) {
      setLoading(false);
      return;
    }

    const formatted = res.data.activeAds.map((ad) => ({
      ...ad,
      image_url: ad.image_url?.startsWith("http")
        ? ad.image_url
        : `${API_URL}${ad.image_url}`,
    }));

    setAds(formatted);
    setActive(0);
    setLoading(false);
  };

  const incrementAdViews = async (adId: string) => {
    const mutation = `
      mutation IncrementAdViews($adId: ID!) {
        incrementAdViews(adId: $adId) {
          id
          views_count
        }
      }
    `;

    try {
      await fetchGraphQL(mutation, { adId });

      setAds((prev) =>
        prev.map((ad) =>
          ad.id === adId
            ? {
                ...ad,
                views_count: (ad.views_count || 0) + 1,
              }
            : ad,
        ),
      );
    } catch (error) {
      console.error("Error incrementing ad views:", error);
    }
  };

  const handleAdClick = async (adId: string) => {
    await incrementAdViews(adId);
    router.push(`/ad/${adId}`);
  };

  const scrollTo = (index: number) => {
    const el = scrollRef.current?.children[index] as HTMLElement;

    setActive(index);

    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const children = Array.from(scrollRef.current.children) as HTMLElement[];

    const center =
      scrollRef.current.scrollLeft + scrollRef.current.offsetWidth / 2;

    let closest = 0;
    let dist = Infinity;

    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;

      const d = Math.abs(center - childCenter);

      if (d < dist) {
        dist = d;
        closest = i;
      }
    });

    setActive(closest);
  };

  const move = (dir: "left" | "right") => {
    const goNext = isRTL ? dir === "left" : dir === "right";
    const next = goNext
      ? Math.min(active + 1, ads.length - 1)
      : Math.max(active - 1, 0);

    scrollTo(next);
  };

  if (loading) {
    return (
      <div className="mt-16 px-4 md:px-8">
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

  if (!ads.length) return null;

  return (
    <section className="mt-16 px-4 md:px-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2
            className={`text-3xl font-extrabold ${
              isDark ? "text-white" : "text-[#F0B100]"
            }`}
          >
            {t("ad")}
          </h2>

          <p
            className={`text-sm mt-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t("Featured sponsored campaigns")}
          </p>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => move("left")}
            className={`w-9 h-9 flex items-center justify-center border rounded-md transition ${
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
            onClick={() => move("right")}
            className={`w-9 h-9 flex items-center justify-center border rounded-md transition ${
              isDark
                ? "bg-[#0b1120] border-[#1e293b] text-white"
                : "bg-gray-200 border-gray-300 text-black"
            }`}
          >
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </motion.button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {ads.map((ad, i) => {
          const isActive = i === active;

          return (
            <motion.div
              key={ad.id}
              onClick={() => handleAdClick(ad.id)}
              animate={{
                scale: isActive ? 1 : 0.92,
                opacity: isActive ? 1 : 0.65,
              }}
              transition={{ duration: 0.35 }}
              className="relative min-w-[350px] md:min-w-[550px] h-[400px] snap-center cursor-pointer overflow-hidden rounded-[32px] group"
            >
              <Image
                src={ad.image_url!}
                alt={ad.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />

              {isActive && (
                <div className="absolute top-6 right-6 z-20">
                  <span className="bg-[#F0B100] text-white px-4 py-1 rounded-full text-xs border border-white/20">
                    {t("Active")}
                  </span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{
                    y: isActive ? 0 : 10,
                    opacity: 1,
                  }}
                >
                  <h3 className="text-white text-3xl font-bold mb-3 line-clamp-2">
                    {ad.title}
                  </h3>

                  {ad.description && (
                    <p className="text-gray-200 text-sm md:text-base max-w-[80%] line-clamp-3 mb-6">
                      {ad.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5 text-sm text-gray-300">
                      <span>👁 {ad.views_count?.toLocaleString() || 0}</span>

                      {ad.created_at && (
                        <span>
                          {new Date(ad.created_at).toLocaleDateString(lang)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdClick(ad.id);
                      }}
                      className="bg-[#F0B100] text-white px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-transform"
                    >
                      {t("View Details")}
                    </button>
                  </div>
                </motion.div>
              </div>

              <div className="absolute inset-0 rounded-[32px] border border-white/10 group-hover:border-[#F0B100]/70 transition-all duration-500" />

              <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_80px_rgba(240,177,0,0.25)]" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
