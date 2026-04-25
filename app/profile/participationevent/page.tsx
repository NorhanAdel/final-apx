"use client";

import React, { useState, useEffect } from "react";
import {
  Mic2,
  ChevronDown,
  Calendar,
  MapPin,
  Search,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import {
  GET_ALL_EVENTS,
  SEARCH_EVENTS,
  GET_EVENTS_BY_SPORT,
  GET_EVENTS_BY_STATUS,
} from "@/app/graphql/query/event.queries";
import BackButton from "@/app/components/BackButton";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  location: string | null;
  image_url: string | null;
  date_start: string;
  status: string;
}

interface Sport {
  id: string;
  name: string;
}

function getFullUrl(url: string | null | undefined): string {
  if (!url) return "/b3.jpg";
  if (url.startsWith("blob:") || url.startsWith("http")) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function formatDate(dateString: string, lang: string): string {
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
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  } catch {
    return dateString;
  }
}

function getStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("upcoming") || lowerStatus.includes("قادم"))
    return "text-green-500";
  if (lowerStatus.includes("ongoing") || lowerStatus.includes("جاري"))
    return "text-yellow-500";
  if (lowerStatus.includes("completed") || lowerStatus.includes("منتهي"))
    return "text-gray-500";
  if (lowerStatus.includes("cancelled") || lowerStatus.includes("ملغي"))
    return "text-red-500";
  return "text-gray-400";
}

export default function ParticipationEvent() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const [isOpen, setIsOpen] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSportId, setSelectedSportId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSportId("");
    setSelectedStatus("");
    setShowFilters(false);
  };

  // Initialize data on mount only
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // Fetch sports
        const sportsResult = await fetchGraphQL<{ sports: Sport[] }>(
          `query GetSports {
            sports {
              id
              name
            }
          }`,
        );
        if (sportsResult.data?.sports) {
          setSports(sportsResult.data.sports);
        }

        // Fetch all events
        const eventsResult = await fetchGraphQL<{ events: Event[] }>(
          GET_ALL_EVENTS,
          { skip: 0, take: 50 },
        );
        if (eventsResult.data?.events) {
          setEvents(eventsResult.data.events);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Handle filter/search changes
  useEffect(() => {
    if (!searchTerm && !selectedSportId && !selectedStatus) {
      return; // Don't fetch if no filters are active
    }

    const fetchFilteredEvents = async () => {
      setLoading(true);
      try {
        let result;

        if (searchTerm.trim()) {
          result = await fetchGraphQL<{ searchEvents: Event[] }>(
            SEARCH_EVENTS,
            { searchTerm: searchTerm.trim() },
          );
          setEvents(result.data?.searchEvents || []);
        } else if (selectedSportId) {
          result = await fetchGraphQL<{ eventsBySport: Event[] }>(
            GET_EVENTS_BY_SPORT,
            { sportId: selectedSportId, skip: 0, take: 50 },
          );
          setEvents(result.data?.eventsBySport || []);
        } else if (selectedStatus) {
          result = await fetchGraphQL<{ eventsByStatus: Event[] }>(
            GET_EVENTS_BY_STATUS,
            { status: selectedStatus, skip: 0, take: 50 },
          );
          setEvents(result.data?.eventsByStatus || []);
        }
      } catch (error) {
        console.error("Error fetching filtered events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredEvents();
  }, [searchTerm, selectedSportId, selectedStatus]);

  const isDark = theme === "dark";

  // Status options for filter
  const statusOptions = [
    { value: "UPCOMING", label: t("Upcoming") },
    { value: "ONGOING", label: t("Ongoing") },
    { value: "COMPLETED", label: t("Completed") },
    { value: "CANCELLED", label: t("Cancelled") },
  ];

  const hasActiveFilters = searchTerm || selectedSportId || selectedStatus;

  return (
    <div
      className={`min-h-screen p-8 py-40 font-sans transition
      ${isDark ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"}`}
    >
      <div
        className={`max-w-4xl mx-auto p-6 rounded-lg relative overflow-hidden
        ${
          isDark
            ? "border-2 border-blue-900/50 bg-[#020617]"
            : "border border-gray-200 bg-white shadow"
        }`}
      >
        <BackButton className="mb-6" />

        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className={`text-4xl font-black italic tracking-tighter uppercase
            ${isDark ? "text-yellow-400" : "text-[#F0B100]"}`}
          >
            {t("Participation Event")}
          </h1>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t("Search events...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 pl-10 rounded-lg outline-none transition
                ${
                  isDark
                    ? "bg-[#0a1128] border border-gray-800 text-white focus:border-yellow-400"
                    : "bg-white border border-gray-300 text-black focus:border-[#F0B100]"
                }`}
              />
              <Search
                size={18}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg transition flex items-center gap-2
                ${
                  showFilters || hasActiveFilters
                    ? isDark
                      ? "bg-yellow-400 text-black"
                      : "bg-[#F0B100] text-black"
                    : isDark
                    ? "bg-[#0a1128] border border-gray-800 text-gray-300"
                    : "bg-white border border-gray-300 text-gray-600"
                }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">{t("Filter")}</span>
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                  {searchTerm
                    ? 1
                    : 0 + (selectedSportId ? 1 : 0) + (selectedStatus ? 1 : 0)}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`px-4 py-3 rounded-lg transition flex items-center gap-2
                  ${
                    isDark
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
              >
                <X size={18} />
                <span className="hidden sm:inline">{t("Clear")}</span>
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div
              className={`mt-3 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4
              ${
                isDark
                  ? "bg-[#0a1128] border border-gray-800"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              {/* Filter by Sport */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Sport")}
                </label>
                <select
                  value={selectedSportId}
                  onChange={(e) => setSelectedSportId(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg outline-none transition
                  ${
                    isDark
                      ? "bg-[#0a1128] border border-gray-800 text-white focus:border-yellow-400"
                      : "bg-white border border-gray-300 text-black focus:border-[#F0B100]"
                  }`}
                >
                  <option value="">{t("All Sports")}</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Status")}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg outline-none transition
                  ${
                    isDark
                      ? "bg-[#0a1128] border border-gray-800 text-white focus:border-yellow-400"
                      : "bg-white border border-gray-300 text-black focus:border-[#F0B100]"
                  }`}
                >
                  <option value="">{t("All Statuses")}</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchTerm && (
              <span
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                ${
                  isDark
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {t("Search")}: {searchTerm}
                <X
                  size={14}
                  className="cursor-pointer hover:opacity-70"
                  onClick={() => setSearchTerm("")}
                />
              </span>
            )}
            {selectedSportId && (
              <span
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                ${
                  isDark
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {t("Sport")}:{" "}
                {sports.find((s) => s.id === selectedSportId)?.name}
                <X
                  size={14}
                  className="cursor-pointer hover:opacity-70"
                  onClick={() => setSelectedSportId("")}
                />
              </span>
            )}
            {selectedStatus && (
              <span
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                ${
                  isDark
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {t("Status")}:{" "}
                {statusOptions.find((s) => s.value === selectedStatus)?.label}
                <X
                  size={14}
                  className="cursor-pointer hover:opacity-70"
                  onClick={() => setSelectedStatus("")}
                />
              </span>
            )}
          </div>
        )}

        {/* Header */}
        <div className="mb-0">
          <h2 className="text-xl font-bold italic mb-2">{t("Event")}</h2>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between p-3 rounded-t-lg transition
            ${
              isDark
                ? "bg-[#0a1128] border border-gray-800"
                : "bg-gray-100 border border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 text-yellow-500">
              <Mic2 size={18} />
              <span className="text-sm font-semibold italic">
                {searchTerm ? t("Search Results") : t("All Events")}
                {hasActiveFilters && ` (${events.length})`}
              </span>
            </div>

            <ChevronDown
              size={20}
              className={`text-yellow-500 transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>

        {/* Events List */}
        <div
          className={`overflow-hidden transition-all duration-500 ${
            isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`space-y-[2px]
            ${
              isDark
                ? "bg-gray-800 border-x border-b border-gray-800"
                : "bg-gray-100 border-x border-b border-gray-200"
            }`}
          >
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
              </div>
            ) : events.length === 0 ? (
              <div
                className={`text-center py-10 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("No events found")}
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`flex flex-col p-3 transition group cursor-pointer
                  ${
                    isDark
                      ? "bg-[#050b1d] hover:bg-[#0a1535]"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Event Image */}
                      <div
                        className={`w-24 h-14 overflow-hidden rounded
                        ${
                          isDark
                            ? "bg-gray-900 border border-blue-900/30"
                            : "bg-gray-200 border border-gray-300"
                        }`}
                      >
                        {event.image_url ? (
                          <Image
                            src={getFullUrl(event.image_url)}
                            alt={event.title}
                            width={96}
                            height={56}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Mic2 size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Event Info */}
                      <div className="flex-1">
                        <h3 className="text-sm md:text-md font-bold italic tracking-tight group-hover:text-yellow-400 transition">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs">
                          <span className="text-yellow-500">
                            {event.event_type}
                          </span>
                          {event.location && (
                            <span
                              className={`flex items-center gap-1 ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              <MapPin size={12} /> {event.location}
                            </span>
                          )}
                          <span
                            className={`flex items-center gap-1 ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            <Calendar size={12} />{" "}
                            {formatDate(event.date_start, lang)}
                          </span>
                          <span className={getStatusColor(event.status)}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Button to go to Participation Page */}
        <div className="mt-8">
          <Link
            href="/clubprofile/eventCard"
            className={`w-full py-4 flex items-center justify-center gap-3 transition group
            ${
              isDark
                ? "bg-[#0a1a44] border-2 border-yellow-600/50 hover:bg-[#0f2563]"
                : "bg-[#F0B100] text-gray-50 hover:bg-yellow-500"
            }`}
          >
            <span className="text-2xl font-black italic uppercase">
              {t("Participation Event")}
            </span>
            <Mic2
              className={isDark ? "text-yellow-500 fill-yellow-500" : ""}
              size={24}
            />
          </Link>
        </div>

        {/* Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-blue-500/10 rounded-tr-full pointer-events-none"></div>
      </div>
    </div>
  );
}
