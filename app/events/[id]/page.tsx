"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, CalendarDays } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";

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
  const { lang } = useTranslate();

  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;
    fetchEvent();
  }, [eventId, lang]);

  const fetchEvent = async () => {
    setLoading(true);
    setError("");

    const query = `
      query GetEvent($id: ID!) {
        event(id: $id) {
          id
          title
          description
          location
          date_start
          status
          image_url
        }
      }
    `;

    try {
      const result = await fetchGraphQL<{ event: Event }>(
        query,
        { id: eventId }
      );  

      const e = result.data?.event;

      setEvent(
        e
          ? {
              ...e,
              image_url: e.image_url || "/b2.jpg",
              date_start: new Date(e.date_start).toLocaleDateString(lang),
            }
          : null
      );
    } catch (err: any) {
      setError(err.message || "Failed to fetch event");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center
        ${theme === "dark" ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}>
        Loading event...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-red-500
        ${theme === "dark" ? "bg-[#020617]" : "bg-gray-100"}`}>
        {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`min-h-screen flex items-center justify-center
        ${theme === "dark" ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}>
        Event not found
      </div>
    );
  }

  return (
    <section
      className={`min-h-screen flex items-center justify-center px-6 py-28 transition
      ${theme === "dark" ? "bg-[#020617]" : "bg-gray-100"}`}
    >
      <div
        className={`max-w-6xl w-full grid md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl border
        ${
          theme === "dark"
            ? "border-blue-900 bg-[#06122a]"
            : "border-gray-200 bg-white"
        }`}
      >

        {/* Image */}
        <div className="relative h-[100%]">
          <Image
            src={
              event.image_url?.startsWith("http")
                ? event.image_url
                : `${process.env.NEXT_PUBLIC_API_URL}${event.image_url}`
            }
            alt={event.title}
            fill
            className="object-cover"
          />

          <div
            className={`absolute inset-0
            ${
              theme === "dark"
                ? "bg-gradient-to-r from-[#020617]/10 via-[#020617]/40 to-[#020617]"
                : "bg-gradient-to-r from-white/10 via-white/20 to-white"
            }`}
          />
        </div>

        {/* Content */}
        <div
          className={`relative p-10
          ${theme === "dark" ? "text-white" : "text-black"}`}
        >
          <h1 className="text-3xl font-bold mb-6">{event.title}</h1>

          <div
            className={`flex flex-wrap gap-4 text-sm mb-6
            ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            <span className="text-orange-400 font-semibold">
              {event.status}
            </span>

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>{event.date_start}</span>
            </div>
          </div>

          <div
            className={`space-y-4 text-sm leading-relaxed
            ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            {event.description ? (
              event.description.split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))
            ) : (
              <p>No description available</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}