"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "next/navigation";  

import "swiper/css";
import "swiper/css/effect-coverflow";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  views_count?: number;
  created_at?: string;
}

export default function AdsSlider() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";

  const router = useRouter();  

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);

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
          video_url
          views_count
          created_at
        }
      }
    `;

    try {
      const result = await fetchGraphQL<{ activeAds: Ad[] }>(query, {});

      if (!result.data?.activeAds) {
        setAds([]);
        return;
      }

      const formatted = result.data.activeAds.map((ad) => ({
        ...ad,
        image_url: ad.image_url
          ? ad.image_url.startsWith("http")
            ? ad.image_url
            : `${API_URL}${ad.image_url}`
          : "/p1.png",
      }));

      setAds(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-14 px-3 sm:px-6 lg:px-10">
        <p className="text-center text-gray-400">{t("loading")}</p>
      </div>
    );
  }

  if (ads.length === 0) return null;

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
          {t("ads")}
        </motion.h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`prevAd w-9 h-9 flex items-center justify-center border rounded-md transition ${
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
            className={`nextAd w-9 h-9 flex items-center justify-center border rounded-md transition ${
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
        modules={[EffectCoverflow, Navigation]}
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        navigation={{
          nextEl: ".nextAd",
          prevEl: ".prevAd",
        }}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          480: { slidesPerView: 1.4 },
          640: { slidesPerView: 1.6 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2.5 },
          1280: { slidesPerView: 3 },
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 120,
          modifier: 2.5,
          slideShadows: false,
        }}
        className="w-full"
      >
        {ads.map((ad) => (
          <SwiperSlide key={ad.id}>
            <motion.div
              onClick={() => router.push(`/ad/${ad.id}`)}  
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.04, y: -8 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl overflow-hidden border shadow-lg transition-all cursor-pointer ${
                isDark
                  ? "bg-[#0b1120] border-[#1e293b]"
                  : "bg-white border-gray-200"
              }`}
            >
              <Link href={`/ad/${ad.id}`}>
                <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] lg:h-[320px] overflow-hidden">
                  <Image
                    src={ad.image_url!}
                    alt={ad.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-4">
                  <h3
                    className={`text-base sm:text-lg font-bold truncate mb-1 ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {ad.title}
                  </h3>
                  {ad.description && (
                    <p
                      className={`text-xs line-clamp-2 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {ad.description}
                    </p>
                  )}
                  {ad.views_count !== undefined && (
                    <div
                      className={`flex justify-between items-center mt-2 text-xs ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      <span>{ad.views_count} views</span>
                      <span>
                        {ad.created_at
                          ? new Date(ad.created_at).toLocaleDateString(lang)
                          : ""}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}