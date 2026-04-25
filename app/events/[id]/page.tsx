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
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    setError("");

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
            lang,
          ),
        });
      } else {
        setEvent(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch event";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId, lang]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const getImageUrl = (url: string | undefined) => {
    if (!url) return "/b2.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center
        ${
          theme === "dark"
            ? "bg-[#020617] text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        <div className="w-12 h-12 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center text-red-500
        ${theme === "dark" ? "bg-[#020617]" : "bg-gray-100"}`}
      >
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center
        ${
          theme === "dark"
            ? "bg-[#020617] text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        {t("eventNotFound")}
      </div>
    );
  }

  return (
    <section
      className={`min-h-screen px-6 py-40 transition
      ${theme === "dark" ? "bg-[#020617]" : "bg-gray-100"}`}
    >
      <div className="max-w-6xl mx-auto">
        <BackButton className="mb-6" />

        <div
          className={`grid md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl border
          ${theme === "dark" ? "border-blue-900" : "border-gray-300"}`}
        >
          {/* Image Section */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900">
            {!imageError && event.image_url ? (
              <div className="relative w-full h-full">
                <Image
                  src={getImageUrl(event.image_url)}
                  alt={event.title}
                  fill
                  className="object-contain md:object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center ${
                  theme === "dark" ? "bg-[#1a1c24]" : "bg-gray-200"
                }`}
              >
                <span
                  className={
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }
                >
                  {t("noImage") || "No image"}
                </span>
              </div>
            )}
          </div>

          {/* Content Section with Scrollbar */}
          <div
            className={`p-6 md:p-8 lg:p-10 overflow-y-auto max-h-[600px] ${
              theme === "dark"
                ? "bg-[#06122a] text-white"
                : "bg-white text-black"
            }`}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-400 mb-4">
              {event.title}
            </h1>

            <div
              className={`flex flex-wrap gap-4 text-sm mb-6 pb-4 border-b ${
                theme === "dark" ? "border-gray-700/50" : "border-gray-200"
              }`}
            >
              <span className="text-orange-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                {event.status}
              </span>
              <div className="flex items-center gap-2 opacity-70">
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 opacity-70">
                <CalendarDays size={16} />
                <span>{event.date_start}</span>
              </div>
            </div>

            <div className="space-y-4 text-sm md:text-base leading-relaxed">
              {event.description ? (
                event.description.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-3">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="opacity-70">{t("noDescription")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
