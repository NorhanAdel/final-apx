"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { MapPin, CalendarDays } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { GET_EVENT_BY_ID } from "@/app/graphql/query/event.queries";
import BackButton from "@/app/components/BackButton";
import { motion } from "framer-motion";

interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  date_start: string;
  status: string;
  image_url?: string;
}

export default function EventDetails() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();

  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isDark = theme === "dark";

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);

    try {
      const result = await fetchGraphQL<{ event: Event }>(GET_EVENT_BY_ID, {
        id: eventId,
      });

      const fetchedEvent = result.data?.event;

      if (fetchedEvent) {
        setEvent({
          ...fetchedEvent,
          image_url: fetchedEvent.image_url || "/b2.jpg",
          date_start: new Date(fetchedEvent.date_start).toLocaleDateString(
            lang
          ),
        });
      } else {
        setEvent(null);
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, lang]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const getImageUrl = (url?: string) => {
    if (!url) return "/b2.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  if (loading || !event) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-black" : "bg-gray-100"
        }`}
      >
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 pt-24 pb-16 transition ${
        isDark
          ? "bg-gradient-to-b from-black via-[#050505] to-black text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <BackButton className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-10"
        >
          {/* IMAGE */}
          <div className="relative h-[480px] rounded-3xl overflow-hidden border shadow-2xl group">
            {!imageError && event.image_url ? (
              <>
                <Image
                  src={getImageUrl(event.image_url)}
                  alt={event.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  onError={() => setImageError(true)}
                  priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-xl font-bold text-white drop-shadow">
                    {event.title}
                  </h2>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col gap-6">

            {/* TITLE */}
            <h1
              className={`text-4xl font-bold ${
                isDark ? "text-yellow-400" : "text-yellow-600"
              }`}
            >
              {event.title}
            </h1>

            {/* META */}
            <div
              className={`flex flex-wrap items-center gap-4 p-4 rounded-xl border text-sm ${
                isDark
                  ? "bg-white/5 border-white/10 text-gray-300"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <span className="px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-semibold">
                {event.status}
              </span>

              <span className="flex items-center gap-1">
                <MapPin size={14} /> {event.location}
              </span>

              <span className="flex items-center gap-1">
                <CalendarDays size={14} /> {event.date_start}
              </span>
            </div>

            {/* DESCRIPTION (SCROLL) */}
            <div
              className={`rounded-2xl p-5 border ${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-gray-300"
              }`}
            >
              <h3
                className={`text-sm mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("Description")}
              </h3>

              <div className="max-h-[260px] overflow-y-auto pr-2 custom-scroll">
                <p
                  className={`text-xl leading-relaxed whitespace-pre-line ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {event.description || t("noDescription")}
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #f0b100;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}