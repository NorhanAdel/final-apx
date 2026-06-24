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
import { GET_EVENTS_BY_SPORT } from "@/app/graphql/query/event.queries";

interface Event {
  id: string;
  title: string;
  location?: string;
  date_start?: string;
  status?: string;
  image_url?: string;
}

 
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
  if (sportId) {
    fetchEvents();
  }
}, [sportId, lang]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
    const result = await fetchGraphQL<{
  eventsBySport: Event[];
}>(
  GET_EVENTS_BY_SPORT,
  {
    sportId,
    skip: 0,
    take: 10,
  }
);

console.log("EVENTS RESPONSE:", result);
 if (result.data?.eventsBySport) {
  const formatted = result.data.eventsBySport.map((event) => ({
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
} else {
  setEvents([]);
}
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
  whileHover={{ y: -8 }}
  transition={{ duration: 0.4 }}
  className="group relative h-[430px] rounded-[30px] overflow-hidden cursor-pointer"
  onClick={() => (window.location.href = `/events/${event.id}`)}
>
  {/* Image */}
  <Image
    src={event.image_url!}
    alt={event.title}
    fill
    className="object-cover transition duration-700 group-hover:scale-110"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

  {/* Status */}
  <div className="absolute top-5 left-5 z-20">
    <div className="px-4 py-2 rounded-full bg-yellow-400 text-black text-xs font-bold shadow-xl">
      {event.status || "Event"}
    </div>
  </div>

  {/* Content */}
  <div className="absolute bottom-0 left-0 right-0 z-20 p-6">

    {/* Date */}
    <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md px-3 py-2 text-sm text-white mb-4">
      {event.date_start
        ? new Date(event.date_start).toLocaleDateString(lang)
        : ""}
    </div>

    {/* Title */}
    <h3 className="text-2xl font-bold text-white line-clamp-2 mb-4">
      {event.title}
    </h3>

    {/* Location */}
    <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl">
      <LocateFixed size={15} className="text-yellow-400" />
      <span className="text-sm text-gray-200 truncate">
        {event.location}
      </span>
    </div>

  </div>
</motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
