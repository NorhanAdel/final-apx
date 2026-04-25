"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";
import { GET_ALL_EVENTS } from "@/app/graphql/query/event.queries";

interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  date_start: string;
  status: string;
  image_url?: string;
  created_at: string;
}

type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

interface StatusOption {
  value: EventStatus | "ALL";
  label: string;
}

export default function EventsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useTranslate();

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"Newest" | "Oldest">("Newest");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions: StatusOption[] = [
    { value: "ALL", label: t("allStatuses") },
    { value: "UPCOMING", label: t("upcoming") },
    { value: "ONGOING", label: t("ongoing") },
    { value: "COMPLETED", label: t("completed") },
    { value: "CANCELLED", label: t("cancelled") },
  ];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const variables: { skip: number; take: number } = {
        skip: 0,
        take: 100,
      };

      const result = await fetchGraphQL<{ events: Event[] }>(
        GET_ALL_EVENTS,
        variables,
      );

      if (result.data?.events) {
        const formatted: Event[] = result.data.events.map((event) => ({
          ...event,
          date_start: new Date(event.date_start).toLocaleDateString(lang),
          image_url: event.image_url
            ? event.image_url.startsWith("http")
              ? event.image_url
              : `${process.env.NEXT_PUBLIC_API_URL}${event.image_url}`
            : "/b2.jpg",
        }));
        setAllEvents(formatted);
      } else {
        setAllEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter and sort events based on current filters
  const getFilteredEvents = useCallback(() => {
    let filtered = [...allEvents];

    // Apply search filter
    if (search) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (event) => event.status?.toUpperCase() === statusFilter,
      );
    }

    // Apply sorting by created_at
    if (sort === "Newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else {
      filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    }

    return filtered;
  }, [allEvents, search, statusFilter, sort]);

  const filteredEvents = getFilteredEvents();

  const getStatusCount = (status: EventStatus | "ALL"): number => {
    if (status === "ALL") return allEvents.length;
    return allEvents.filter((event) => event.status?.toUpperCase() === status)
      .length;
  };

  const clearFilters = (): void => {
    setStatusFilter("ALL");
    setSearch("");
    setSort("Newest");
    setShowFilters(false);
    setIsFilterOpen(false);
  };

  const handleStatusFilterChange = (status: EventStatus | "ALL"): void => {
    setStatusFilter(status);
    setIsFilterOpen(false);
  };

  const hasActiveFilters: boolean =
    statusFilter !== "ALL" || search !== "" || sort !== "Newest";

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center
        ${
          theme === "dark"
            ? "bg-[#020b1c] text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 md:px-12 lg:px-30 py-40 transition
      ${
        theme === "dark" ? "bg-[#020b1c] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex gap-4">
          <div
            className={`flex-1 flex items-center rounded-lg px-3 py-2 border
            ${
              theme === "dark"
                ? "bg-[#071632] border-[#F0B100]"
                : "bg-white border-gray-300"
            }`}
          >
            <Search size={18} className="text-gray-500" />
            <input
              placeholder={t("searchEvents")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`bg-transparent outline-none w-full text-sm ml-2
              ${theme === "dark" ? "text-white" : "text-black"}`}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition
              ${
                showFilters || hasActiveFilters
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : theme === "dark"
                  ? "bg-[#071632] border-[#F0B100] text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">{t("filter")}</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                {(statusFilter !== "ALL" ? 1 : 0) +
                  (search ? 1 : 0) +
                  (sort !== "Newest" ? 1 : 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition
                ${
                  theme === "dark"
                    ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                    : "bg-red-100 text-red-600 border-red-200 hover:bg-red-200"
                }`}
            >
              <X size={18} />
              <span className="hidden sm:inline">{t("clear")}</span>
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            className={`p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 border
            ${
              theme === "dark"
                ? "bg-[#071632] border-[#0f2b70]"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Filter by Status */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("status")}
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm border
                    ${
                      theme === "dark"
                        ? "bg-[#0a0f2c] border-[#1e2a5a] text-white"
                        : "bg-white border-gray-300 text-black"
                    }`}
                >
                  <span>
                    {statusOptions.find((s) => s.value === statusFilter)
                      ?.label || t("allStatuses")}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isFilterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div
                      className={`absolute top-full left-0 mt-2 w-full rounded-lg shadow-lg overflow-hidden z-20
                        ${
                          theme === "dark"
                            ? "bg-[#0a0f2c] border border-[#1e2a5a]"
                            : "bg-white border border-gray-200"
                        }`}
                    >
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusFilterChange(option.value)}
                          className={`w-full px-4 py-2 text-left text-sm transition flex items-center justify-between
                            ${
                              statusFilter === option.value
                                ? theme === "dark"
                                  ? "bg-yellow-400/20 text-yellow-400"
                                  : "bg-yellow-50 text-yellow-600"
                                : theme === "dark"
                                ? "hover:bg-[#1e2a5a] text-gray-300"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                option.value === "UPCOMING"
                                  ? "bg-green-500"
                                  : option.value === "ONGOING"
                                  ? "bg-yellow-500"
                                  : option.value === "COMPLETED"
                                  ? "bg-blue-500"
                                  : option.value === "CANCELLED"
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {option.label}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20">
                            {getStatusCount(option.value)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sort by */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {t("sortBy")}
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "Newest" | "Oldest")}
                className={`w-full px-4 py-2 rounded-lg text-sm border
                  ${
                    theme === "dark"
                      ? "bg-[#071632] border-[#F0B100] text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
              >
                <option value="Newest">
                  {t("newest")}
                </option>
                <option value="Oldest">
                  {t("oldest")}
                </option>
              </select>
              <p
                className={`text-xs mt-1 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {t("sortedByCreationDate")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilter !== "ALL" && (
            <span
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                ${
                  theme === "dark"
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {t("status")}:{" "}
              {statusOptions.find((s) => s.value === statusFilter)?.label}
              <X
                size={14}
                className="cursor-pointer hover:opacity-70"
                onClick={() => handleStatusFilterChange("ALL")}
              />
            </span>
          )}
          {search && (
            <span
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                ${
                  theme === "dark"
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {t("search")}: {search}
              <X
                size={14}
                className="cursor-pointer hover:opacity-70"
                onClick={() => setSearch("")}
              />
            </span>
          )}
          {sort !== "Newest" && (
            <span
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                ${
                  theme === "dark"
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {t("sort")}: {sort === "Oldest" ? t("oldest") : sort}
              <X
                size={14}
                className="cursor-pointer hover:opacity-70"
                onClick={() => setSort("Newest")}
              />
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {filteredEvents.length === 0 ? (
        <p className="text-center text-gray-400">{t("noEvents")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className={`relative h-[400px] overflow-hidden cursor-pointer rounded-xl border transition hover:scale-[1.02] duration-300
                ${
                  theme === "dark"
                    ? "border-[#0f2b70] bg-[#071632]"
                    : "border-gray-200 bg-white shadow-md"
                }`}
            >
              <Image
                src={event.image_url!}
                alt={event.title}
                width={600}
                height={400}
                className="w-full h-[280px] object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2 line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-gray-500 text-sm">{event.location}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span>{event.date_start}</span>
                  <span
                    className={`font-bold ${
                      event.status?.toLowerCase() === "upcoming"
                        ? "text-green-500"
                        : event.status?.toLowerCase() === "ongoing"
                        ? "text-yellow-500"
                        : event.status?.toLowerCase() === "completed"
                        ? "text-blue-500"
                        : "text-red-500"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
