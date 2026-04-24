"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import useTranslate from "../hooks/useTranslate";
import { fetchGraphQL } from "../lib/fetchGraphQL";

interface Event {
  id: string;
  title: string;
  location: string;
  date_start: string;
  status: string;
  image_url?: string;
}

export default function EventsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { lang } = useTranslate();

  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
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

    try {
      const result = await fetchGraphQL<{ events: Event[] }>(
        query,
        {} // ✅ شيلنا lang من هنا
      );

      if (result.data?.events) {
        const formatted = result.data.events.map((e) => ({
          ...e,
          date_start: new Date(e.date_start).toLocaleDateString(lang),
          image_url: e.image_url
            ? e.image_url.startsWith("http")
              ? e.image_url
              : `${process.env.NEXT_PUBLIC_API_URL}${e.image_url}`
            : "/b2.jpg",
        }));

        setEvents(formatted);
        setFiltered(formatted);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...events];

    if (search) {
      data = data.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case "Newest":
        data.sort(
          (a, b) =>
            new Date(b.date_start).getTime() -
            new Date(a.date_start).getTime()
        );
        break;

      case "Oldest":
        data.sort(
          (a, b) =>
            new Date(a.date_start).getTime() -
            new Date(b.date_start).getTime()
        );
        break;

      case "Upcoming":
        data = data.filter((e) => e.status === "upcoming");
        break;

      case "Completed":
        data = data.filter((e) => e.status === "completed");
        break;
    }

    setFiltered(data);
  }, [search, sort, events]);

  return (
    <div
      className={`min-h-screen px-4 sm:px-6 md:px-12 lg:px-30 py-40 transition
      ${
        theme === "dark"
          ? "bg-[#020b1c] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      {/* SEARCH + FILTER */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <div
          className={`flex items-center rounded-lg px-3 py-2 w-full border
          ${
            theme === "dark"
              ? "bg-[#071632] border-[#F0B100]"
              : "bg-white border-gray-300"
          }`}
        >
          <Search size={18} className="text-gray-500" />

          <input
            placeholder={
              lang === "ar"
                ? "ابحث عن الأحداث..."
                : "Search events..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`bg-transparent outline-none w-full text-sm ml-2
            ${theme === "dark" ? "text-white" : "text-black"}`}
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={`px-4 py-2 rounded-lg text-sm border
          ${
            theme === "dark"
              ? "bg-[#071632] border-[#F0B100] text-white"
              : "bg-white border-gray-300 text-black"
          }`}
        >
          {["Newest", "Oldest", "Upcoming", "Completed"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* GRID */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400">No events found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className={`relative h-[400px] overflow-hidden cursor-pointer rounded-xl border transition
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
                <h3 className="text-lg font-bold mb-2">
                  {event.title}
                </h3>

                <p className="text-gray-500">{event.location}</p>

                <div className="flex justify-between mt-2 text-sm">
                  <span>{event.date_start}</span>
                  <span className="text-orange-400 font-bold">
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