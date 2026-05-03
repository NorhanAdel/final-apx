"use client";

import { useEffect, useState } from "react";
import {
  LocateFixed,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_ALL_EVENTS } from "@/app/graphql/query/event.queries";

interface Event {
  id: string;
  title: string;
  location?: string;
  date_start?: string;
  status?: string;
  image_url?: string;
}

/* ✅ ضفنا ده بس */
interface EventsSectionProps {
  sportId: string;
}

export default function EventsSection({ sportId }: EventsSectionProps) {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [lang]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ events: Event[] }>(
        GET_ALL_EVENTS,
        { skip: 0, take: 10 }
      );

      if (result.data?.events) {
        const formatted = result.data.events.map((event) => ({
          id: event.id,
          title: event.title,
          location: event.location || "Location TBD",
          date_start: event.date_start,
          status: event.status,
          image_url: event.image_url
            ? event.image_url.startsWith("http")
              ? event.image_url
              : `${process.env.NEXT_PUBLIC_API_URL}${event.image_url}`
            : "/r1.png",
        }));

        setEvents(formatted);
      } else setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-14 px-4 text-center text-gray-400">
        {t("loading")}
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="mt-16 px-4 sm:px-6 lg:px-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className={`text-2xl sm:text-3xl font-bold tracking-wide ${
            isDark ? "text-white" : "text-[#F0B100]"
          }`}
        >
          {t("events")}
        </motion.h2>

        <div className="flex gap-2">
          <button className="prevEvent w-10 h-10 flex items-center justify-center border rounded-xl backdrop-blur-md">
            <ChevronLeft size={18} />
          </button>
          <button className="nextEvent w-10 h-10 flex items-center justify-center border rounded-xl backdrop-blur-md">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* SWIPER */}
      <Swiper
        modules={[Navigation]}
        navigation={{ nextEl: ".nextEvent", prevEl: ".prevEvent" }}
        spaceBetween={25}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ duration: 0.4 }}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all ${
                isDark
                  ? "bg-[#0b1120] border border-white/10"
                  : "bg-white border border-gray-200"
              } shadow-2xl`}
              onClick={() =>
                (window.location.href = `/events/${event.id}`)
              }
            >
              {/* IMAGE */}
              <div className="relative w-full h-[260px] overflow-hidden">
                <Image
                  src={event.image_url!}
                  alt={event.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110 group-hover:blur-[1px]"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* STATUS */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-yellow-400 text-black font-semibold shadow-lg">
                    {event.status || "Event"}
                  </span>
                </div>

                {/* TITLE */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white drop-shadow-lg line-clamp-2">
                    {event.title}
                  </h3>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1 text-gray-400">
                    <LocateFixed size={12} />
                    {event.location}
                  </span>

                  <span className="text-gray-400">
                    {event.date_start
                      ? new Date(event.date_start).toLocaleDateString(lang)
                      : ""}
                  </span>
                </div>
              </div>

              {/* GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl border border-yellow-400/30 shadow-[0_0_40px_rgba(240,177,0,0.2)]" />
              </div>

            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}