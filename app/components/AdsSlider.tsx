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

  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [ads, setAds] = useState<Ad[]>([]);
  const [active, setActive] = useState(0);

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

  const scrollTo = (index: number) => {
    const el = scrollRef.current?.children[index] as HTMLElement;
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const children = Array.from(scrollRef.current.children) as HTMLElement[];
    const center = scrollRef.current.scrollLeft + scrollRef.current.offsetWidth / 2;

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
    const next =
      dir === "left"
        ? Math.max(active - 1, 0)
        : Math.min(active + 1, ads.length - 1);

    scrollTo(next);
  };

  return (
    <div className="mt-14 px-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${
          isDark ? "text-white" : "text-[#F0B100]"
        }`}>
          {t("ad")}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => move("left")}
            className="w-9 h-9 border rounded-md"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => move("right")}
            className="w-9 h-9 border rounded-md"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 px-2 scrollbar-hide"
      >
        {ads.map((ad, i) => {
          const isActive = i === active;

          return (
            <motion.div
              key={ad.id}
              onClick={() => router.push(`/ad/${ad.id}`)}
              animate={{
                scale: isActive ? 1 : 0.9,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
              className={`min-w-[340px] snap-center cursor-pointer rounded-3xl overflow-hidden border shadow-xl ${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Image */}
              <div className="relative h-[230px] overflow-hidden">
                <Image
                  src={ad.image_url!}
                  alt={ad.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold truncate text-white">
                  {ad.title}
                </h3>

                {ad.description && (
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1">
                    {ad.description}
                  </p>
                )}

                <div className="flex justify-between text-xs text-gray-400 mt-3">
                  <span>{ad.views_count} views</span>
                  <span>
                    {ad.created_at
                      ? new Date(ad.created_at).toLocaleDateString(lang)
                      : ""}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
