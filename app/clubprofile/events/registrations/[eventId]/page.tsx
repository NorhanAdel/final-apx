"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { toast } from "sonner";
import {
  GET_EVENT_BY_ID,
  GET_EVENT_REGISTRATIONS,
} from "@/app/graphql/query/event.queries";
import { UPDATE_REGISTRATION_STATUS } from "@/app/graphql/mutation/event.mutations";

interface Registration {
  id: string;
  status: string;
  player_id: string;
  registered_at: string;
  player?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url: string;
  };
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  location: string | null;
  image_url: string | null;
  date_start: string;
  date_end: string | null;
  max_participants: number | null;
  status: string;
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
      { year: "numeric", month: "short", day: "numeric" },
    );
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch {
    return dateString;
  }
}

function getRegistrationStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "pending") return "text-yellow-500 bg-yellow-500/10";
  if (lowerStatus === "accepted") return "text-green-500 bg-green-500/10";
  if (lowerStatus === "rejected") return "text-red-500 bg-red-500/10";
  if (lowerStatus === "attended") return "text-blue-500 bg-blue-500/10";
  return "text-gray-500 bg-gray-500/10";
}

function getRegistrationStatusText(
  status: string,
  t: (key: string) => string,
): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "pending") return t("Pending");
  if (lowerStatus === "accepted") return t("Accepted");
  if (lowerStatus === "rejected") return t("Rejected");
  if (lowerStatus === "attended") return t("Attended");
  return status;
}

const getFullImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
};

export default function EventRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";

  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchEventDetails = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ event: Event }>(GET_EVENT_BY_ID, {
        id: eventId,
      });
      if (result.data?.event) setEvent(result.data.event);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  }, [eventId]);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ eventRegistrations: Registration[] }>(
        GET_EVENT_REGISTRATIONS,
        { eventId },
      );
      if (result.data?.eventRegistrations)
        setRegistrations(result.data.eventRegistrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error(t("Failed to load registrations"));
    } finally {
      setLoading(false);
    }
  }, [eventId, t]);

  useEffect(() => {
    fetchEventDetails();
    fetchRegistrations();
  }, [fetchEventDetails, fetchRegistrations]);

  const handleUpdateStatus = async (
    registrationId: string,
    newStatus: string,
  ) => {
    setProcessing(true);
    try {
      const result = await fetchGraphQL<{
        updateRegistrationStatus: { id: string; status: string };
      }>(UPDATE_REGISTRATION_STATUS, {
        id: registrationId,
        input: { status: newStatus },
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data?.updateRegistrationStatus) {
        toast.success(
          t(`Registration ${newStatus.toLowerCase()} successfully`),
        );
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("Failed to update status"));
    } finally {
      setProcessing(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter === "all") return true;
    return reg.status.toLowerCase() === filter.toLowerCase();
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status.toLowerCase() === "pending")
      .length,
    accepted: registrations.filter((r) => r.status.toLowerCase() === "accepted")
      .length,
    rejected: registrations.filter((r) => r.status.toLowerCase() === "rejected")
      .length,
  };

  return (
    <div
      className={`min-h-screen py-20 px-6 transition ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-md transition ${
            isDark
              ? "bg-[#0a1128] hover:bg-[#0f1f4a]"
              : "bg-white shadow hover:bg-gray-100"
          }`}
        >
          <ArrowLeft size={18} />
          {t("Back")}
        </button>

        {event && (
          <div
            className={`p-6 rounded-xl mb-6 ${
              isDark
                ? "bg-[#0a1128] border border-[#0f2b63]"
                : "bg-white shadow"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="text-yellow-500 font-bold">
                    {event.event_type}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {formatDate(event.date_start, lang)}
                  </span>
                  {event.max_participants && (
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {event.max_participants} {t("spots")}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  event.status === "CANCELLED"
                    ? "bg-red-500/20 text-red-500"
                    : "bg-green-500/20 text-green-500"
                }`}
              >
                {event.status}
              </span>
            </div>
          </div>
        )}

        {/* Horizontal Stats Row */}
        <div className="flex flex-row gap-4 mb-6">
          {[
            { label: t("Total"), value: stats.total, color: "" },
            {
              label: t("Pending"),
              value: stats.pending,
              color: "text-yellow-500",
            },
            {
              label: t("Accepted"),
              value: stats.accepted,
              color: "text-green-500",
            },
            {
              label: t("Rejected"),
              value: stats.rejected,
              color: "text-red-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`flex-1 p-4 rounded-xl text-center ${
                isDark
                  ? "bg-[#0a1128] border border-[#0f2b63]"
                  : "bg-white shadow"
              }`}
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "pending", "accepted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === status
                  ? isDark
                    ? "bg-yellow-400 text-black"
                    : "bg-[#F0B100] text-black"
                  : isDark
                  ? "bg-[#0a1128] text-gray-400 hover:text-white"
                  : "bg-gray-200 text-gray-600 hover:text-black"
              }`}
            >
              {status === "all"
                ? t("All")
                : t(status.charAt(0).toUpperCase() + status.slice(1))}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-yellow-500" />
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div
            className={`text-center py-20 rounded-xl ${
              isDark ? "bg-[#0a1128]" : "bg-white"
            }`}
          >
            <UserCheck size={48} className="mx-auto mb-4 text-gray-500" />
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              {t("No registrations found")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRegistrations.map((reg) => (
              <div
                key={reg.id}
                className={`p-4 rounded-xl transition ${
                  isDark
                    ? "bg-[#0a1128] border border-[#0f2b63]"
                    : "bg-white border border-gray-200 shadow"
                }`}
              >
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push(`/players/${reg.player_id}`)}
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center overflow-hidden border border-yellow-500/30">
                      {reg.player?.profile_image_url ? (
                        <Image
                          src={getFullImageUrl(reg.player.profile_image_url)}
                          alt={reg.player.first_name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <UserCheck size={20} className="text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-bold hover:text-yellow-500 transition ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        {reg.player?.first_name} {reg.player?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("Registered on")}:{" "}
                        {formatDateTime(reg.registered_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${getRegistrationStatusColor(
                        reg.status,
                      )}`}
                    >
                      {getRegistrationStatusText(reg.status, t)}
                    </span>

                    {/* تصحيح شرط ظهور الأزرار ليكون حساساً لحالة الـ status بغض النظر عن حالة الأحرف */}
                    {reg.status.toUpperCase() === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(reg.id, "ACCEPTED")}
                          disabled={processing}
                          className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition disabled:opacity-50 border border-green-500/20"
                          title={t("Accept")}
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(reg.id, "REJECTED")}
                          disabled={processing}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-50 border border-red-500/20"
                          title={t("Reject")}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
