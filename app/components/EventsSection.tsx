// app/components/EventsSection.tsx

"use client";

import { useEffect, useState } from "react";
import {
  LocateFixed,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import {
  GET_EVENTS_BY_SPORT,
  GET_ALL_EVENTS,
} from "@/app/graphql/query/event.queries";

interface Event {
  id: string;
  title: string;
  location?: string;
  date_start?: string;
  status?: string;
  image_url?: string;
  sport_id?: string;
}

interface Sport {
  id: string;
  name: string;
}

export default function EventsSection() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";

  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [selectedSportName, setSelectedSportName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (selectedSportId) {
      fetchEventsBySport();
    } else {
      fetchEvents();
    }
  }, [selectedSportId, lang]);

  const fetchSports = async () => {
    try {
      const query = `
        query {
          sports {
            id
            name
          }
        }
      `;
      const result = await fetchGraphQL<{ sports: Sport[] }>(query, {});
      if (result.data?.sports) {
        setSports(result.data.sports);
      }
    } catch (error) {
      console.error("Error fetching sports:", error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ events: Event[] }>(GET_ALL_EVENTS, {
        skip: 0,
        take: 10,
      });

      if (result.data?.events) {
        const formatted: Event[] = result.data.events.map((event) => ({
          id: event.id,
          title: event.title,
          location: event.location,
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
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsBySport = async () => {
    if (!selectedSportId) return;

    setLoading(true);
    try {
      const result = await fetchGraphQL<{ eventsBySport: Event[] }>(
        GET_EVENTS_BY_SPORT,
        { sportId: selectedSportId, skip: 0, take: 10 },
      );

      if (result.data?.eventsBySport && result.data.eventsBySport.length > 0) {
        const formatted: Event[] = result.data.eventsBySport.map((event) => ({
          id: event.id,
          title: event.title,
          location: event.location || "Location TBD",
          date_start: event.date_start,
          status: event.status,
          image_url: "/r1.png",
        }));
        setEvents(formatted);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events by sport:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSportSelect = (sportId: string, sportName: string) => {
    setSelectedSportId(sportId);
    setSelectedSportName(sportName);
    setIsDropdownOpen(false);
  };

  const handleAllSports = () => {
    setSelectedSportId("");
    setSelectedSportName("");
    setIsDropdownOpen(false);
  };

  const getSelectedSportName = () => {
    if (!selectedSportId) return t("allSports");
    return selectedSportName;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(
        lang === "ar"
          ? "ar-EG"
          : lang === "pt"
          ? "pt-PT"
          : lang === "zh"
          ? "zh-CN"
          : "en-US",
        { year: "numeric", month: "short", day: "numeric" },
      );
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="mt-14 px-3 sm:px-6 lg:px-10">
        <div className="text-center text-gray-400">{t("loading")}</div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="mt-14 px-3 sm:px-6 lg:px-10">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          className={`text-lg sm:text-2xl font-bold italic tracking-wide ${
            isDark ? "text-white" : "text-[#F0B100]"
          }`}
        >
          {selectedSportId
            ? `${selectedSportName} ${t("Events")}`
            : t("events")}
        </motion.h2>

        <div className="flex gap-2 items-center">
          {/* Sport Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
                isDark
                  ? "bg-[#0b1120] border-[#1e293b] text-white hover:border-yellow-400"
                  : "bg-white border-gray-300 text-black hover:border-yellow-400"
              }`}
            >
              <Filter size={14} />
              <span className="text-sm">{getSelectedSportName()}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div
                  className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-20 ${
                    isDark
                      ? "bg-[#0a0f2c] border border-[#1e2a5a]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <button
                    onClick={handleAllSports}
                    className={`w-full px-4 py-2 text-left text-sm transition ${
                      !selectedSportId
                        ? isDark
                          ? "bg-yellow-400/20 text-yellow-400"
                          : "bg-yellow-50 text-yellow-600"
                        : isDark
                        ? "hover:bg-[#1e2a5a] text-gray-300"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {t("allSports")}
                  </button>
                  {sports.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => handleSportSelect(sport.id, sport.name)}
                      className={`w-full px-4 py-2 text-left text-sm transition ${
                        selectedSportId === sport.id
                          ? isDark
                            ? "bg-yellow-400/20 text-yellow-400"
                            : "bg-yellow-50 text-yellow-600"
                          : isDark
                          ? "hover:bg-[#1e2a5a] text-gray-300"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {sport.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`prevEvent w-9 h-9 flex items-center justify-center border rounded-md transition ${
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
              className={`nextEvent w-9 h-9 flex items-center justify-center border rounded-md transition ${
                isDark
                  ? "bg-[#0b1120] border-[#1e293b] text-white"
                  : "bg-gray-200 border-gray-300 text-black"
              }`}
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{ nextEl: ".nextEvent", prevEl: ".prevEvent" }}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1.1 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.2 },
        }}
      >
        {events.map((event) => (
          <SwiperSlide key={event.id}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.04, y: -8 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl overflow-hidden border shadow-lg transition-all cursor-pointer ${
                isDark
                  ? "bg-[#0b1120] border-[#1e293b]"
                  : "bg-white border-gray-200"
              }`}
              onClick={() => (window.location.href = `/events/${event.id}`)}
            >
              <div className="relative w-full h-[220px] sm:h-[250px] overflow-hidden">
                <Image
                  src={event.image_url!}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="p-4">
                <h3
                  className={`text-base sm:text-lg font-bold truncate mb-2 ${
                    isDark ? "text-white" : "text-black"
                  }`}
                >
                  {event.title}
                </h3>
                <div
                  className={`flex flex-col gap-2 text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-500 font-semibold">
                      {event.status}
                    </span>
                    <span className="flex items-center">
                      <LocateFixed size={12} className="text-yellow-500 mr-1" />
                      {event.location || t("Unknown")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-500">
                      {event.date_start
                        ? formatDate(event.date_start)
                        : t("dateTBA") || "Date TBA"}{" "}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
