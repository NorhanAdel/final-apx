"use client";

import { LocateFixed, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TRANSLATION ================= */
const T: any = {
  en: {
    title: "Events",
    loading: "Loading...",
    empty: "No Events Found",
  },
  ar: {
    title: "الفعاليات",
    loading: "جاري التحميل...",
    empty: "لا توجد فعاليات",
  },
  pt: {
    title: "Eventos",
    loading: "Carregando...",
    empty: "Nenhum evento encontrado",
  },
  zh: {
    title: "活动",
    loading: "加载中...",
    empty: "未找到活动",
  },
};

/* ================= TYPES ================= */
interface Event {
  id: string;
  title: string;
  location?: string;
  date_start?: string;
  status?: string;
  image_url?: string;
}

export default function EventsSection() {
  const { theme } = useTheme();
  const { lang } = useTranslate();

  const t = T[lang] || T.en;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [lang]);

  const fetchEvents = async () => {
    setLoading(true);

    const query = `
      query {
        events {
          id
          title
          location
          date_start
          status
          image_url
        }
      }
    `;

    const result = await fetchGraphQL<{ events: Event[] }>(
      query,
      {}
    );

    if (result.data?.events) {
      const formatted = result.data.events.map((e: any) => ({
        ...e,
        image_url: e.image_url
          ? e.image_url.startsWith("http")
            ? e.image_url
            : `${API_URL}${e.image_url}`
          : "/r1.png",
      }));

      setEvents(formatted);
    } else {
      setEvents([]);
    }

    setLoading(false);
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="mt-16 sm:mt-20 md:mt-28 px-4 sm:px-6 md:px-8 lg:px-10"
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">

        <h2
          className={`text-xl sm:text-2xl md:text-3xl font-bold italic
          ${theme === "dark" ? "text-white" : "text-[#F0B100]"}`}
        >
          {t.title}
        </h2>

        <div className="flex gap-2 sm:gap-3">
          <div className="prevEvent cursor-pointer w-10 h-10 flex items-center justify-center border">
            <ChevronLeft size={18} />
          </div>

          <div className="nextEvent cursor-pointer w-10 h-10 flex items-center justify-center border">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <p className="text-center text-gray-400">{t.loading}</p>
      ) : events.length === 0 ? (
        <p className="text-center text-red-400">{t.empty}</p>
      ) : (
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          navigation={{
            nextEl: ".nextEvent",
            prevEl: ".prevEvent",
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {events.map((e) => (
            <SwiperSlide key={e.id}>
              <Link href={`/events/${e.id}`}>
                <div
                  className={`h-[380px] rounded-xl overflow-hidden transition cursor-pointer
                  ${
                    theme === "dark"
                      ? "bg-[#0b1120]"
                      : "bg-white shadow-md border"
                  }`}
                >
                  {/* IMAGE */}
                  <div className="relative h-[240px] w-full">
                    <Image
                      src={e.image_url!}
                      alt={e.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <h3
                      className={`text-lg md:text-xl font-bold italic mb-4 line-clamp-2
                      ${theme === "dark" ? "text-white" : "text-black"}`}
                    >
                      {e.title}
                    </h3>

                    <div
                      className={`flex justify-between items-center text-sm
                      ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      <span className="text-[#FDC700] font-bold">
                        {e.status}
                      </span>

                      <span className="flex items-center">
                        <LocateFixed size={14} className="text-[#FDC700] mr-1" />
                        {e.location}
                      </span>

                      <span className="text-[#FDC700] text-xs">
                        {e.date_start
                          ? new Date(e.date_start).toLocaleDateString(lang)
                          : ""}
                      </span>
                    </div>

                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}