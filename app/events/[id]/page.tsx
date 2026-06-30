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

export default function EventDetailsVisualSplit() {
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
            lang === "ar" ? "ar-EG" : "en-US"
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

  const bg = isDark ? "bg-[#030308]" : "bg-gray-50";
  const text = isDark ? "text-white" : "text-gray-900";
  const cardBg = isDark ? "bg-[#0c0d1e]" : "bg-white";
  const border = isDark ? "border-white/[0.06]" : "border-[#CE1126]/10";
  const innerSection = isDark ? "bg-[#11122b]" : "bg-gray-100";

  if (loading || !event) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <div className="w-10 h-10 border-4 border-[#CE1126] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 py-32 transition-colors duration-300 ${bg} ${text}`}>
      
      {!imageError && event.image_url && (
        <div className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none opacity-15 dark:opacity-20 blur-3xl select-none">
          <Image
            src={getImageUrl(event.image_url)}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="mb-8">
          <BackButton />
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-3xl overflow-hidden border ${border} ${cardBg} shadow-2xl items-stretch`}>
          
          <div className="lg:col-span-5 relative h-[350px] lg:h-auto min-h-[400px] bg-neutral-900">
            {!imageError && event.image_url ? (
              <Image
                src={getImageUrl(event.image_url)}
                alt={event.title}
                fill
                priority
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-black uppercase tracking-widest">
                No Preview Available
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/10 to-transparent" />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              <div className="space-y-4">
                <span className="inline-flex items-center px-3 py-1 text-[10px] font-black tracking-widest uppercase font-mono rounded-full bg-[#CE1126]/10 text-[#CE1126] border border-[#CE1126]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CE1126] animate-pulse mr-1.5 ml-1.5" />
                  {event.status}
                </span>
                
                <div className="relative">
                  <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight leading-tight">
                    {event.title}
                  </h1>
                  <div className="w-16 h-[4px] bg-[#CE1126] mt-3 rounded-full" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${border} ${innerSection} text-xs font-bold`}>
                  <CalendarDays size={14} className="text-[#CE1126]" />
                  <span className="text-gray-400 font-mono">{event.date_start}</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${border} ${innerSection} text-xs font-bold`}>
                  <MapPin size={14} className="text-[#CE1126]" />
                  <span className="text-gray-400">{event.location}</span>
                </div>
              </div>

              <div className={`flex-1 flex flex-col p-5 rounded-2xl border ${border} ${innerSection} min-h-[250px]`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block border-b border-white/[0.04] pb-2">
                  {t("Description") || "EVENT LOG DETAILS"}
                </span>
                <div className="max-h-[280px] lg:max-h-[340px] overflow-y-auto pr-2 custom-modern-scroll flex-1">
                  <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {event.description || t("noDescription")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .custom-modern-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-modern-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-modern-scroll::-webkit-scrollbar-thumb {
          background: #CE1126;
          border-radius: 10px;
        }
        .custom-modern-scroll::-webkit-scrollbar-thumb:hover {
          background: #A00D1D;
        }
      `}</style>
    </div>
  );
}
