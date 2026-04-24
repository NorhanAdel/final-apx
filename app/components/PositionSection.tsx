"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TRANSLATION ================= */
const TITLE_T: any = {
  en: "Position",
  ar: "المراكز",
  pt: "Posição",
  zh: "位置",
};

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
  const { lang } = useTranslate();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  const isRTL = lang === "ar";

  useEffect(() => {
    fetchPositions();
  }, [lang]);

  const fetchPositions = async () => {
    setLoading(true);

    const query = `
      query {
        sportPositions {
          id
          name
          category
          sport {
            id
            name
            image_url
          }
        }
      }
    `;

    try {
      const result = await fetchGraphQL<{ sportPositions: Position[] }>(
        query,
        {}
      );

      if (!result.data?.sportPositions) {
        setPositions([]);
        return;
      }

      setPositions(result.data.sportPositions);
    } catch (err) {
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mt-14 sm:mt-16 md:mt-20 px-4 sm:px-6 md:px-10 lg:px-12"
    >
      <h2
        className={`text-center text-xl sm:text-2xl md:text-3xl font-bold italic mb-6 sm:mb-8
        ${theme === "dark" ? "text-white" : "text-[#F0B100]"}`}
      >
        {TITLE_T[lang] || "Position"}
      </h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : positions.length === 0 ? (
        <p className="text-center text-red-400">No Positions Found</p>
      ) : (
        <Swiper
          spaceBetween={15}
          className="w-full"
          breakpoints={{
            0: { slidesPerView: 1.5, spaceBetween: 10 },
            640: { slidesPerView: 2.2, spaceBetween: 15 },
            1024: { slidesPerView: 2.3, spaceBetween: 25 },
          }}
        >
          {positions.map((p) => (
            <SwiperSlide key={p.id}>
              <Link href="/players" className="block">
                <div
                  className={`flex items-center h-[90px] sm:h-[100px] md:h-[120px]
                  rounded-xl overflow-hidden cursor-pointer border transition-all duration-300
                  ${
                    theme === "dark"
                      ? "bg-[#020617] border-white/20 hover:border-white"
                      : "bg-white border-gray-200 hover:border-gray-400 shadow-md"
                  }`}
                >
                  <div className="w-1/2 h-full relative">
                    <Image
                      src={
                        p.sport?.image_url
                          ? p.sport.image_url.startsWith("http")
                            ? p.sport.image_url
                            : `${API_URL}${p.sport.image_url}`
                          : "/p1.png"
                      }
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div
                    className={`w-1/2 flex flex-col justify-center px-4 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <h3
                      className={`text-sm sm:text-lg md:text-xl font-semibold italic ${
                        theme === "dark" ? "text-white" : "text-[#F0B100]"
                      }`}
                    >
                      {p.name}
                    </h3>

                    {p.category && (
                      <span className="text-xs text-gray-400 mt-1">
                        {p.category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}