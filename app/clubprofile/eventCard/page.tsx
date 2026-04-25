"use client";

import { useState, useEffect, useCallback } from "react";
import {
  KeyRound,
  ChevronDown,
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  XCircle,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import {
  GET_ALL_EVENTS,
  GET_MY_EVENT_REGISTRATIONS,
} from "@/app/graphql/query/event.queries";
import {
  REGISTER_TO_EVENT,
  CANCEL_REGISTRATION,
} from "@/app/graphql/mutation/event.mutations";
import { toast } from "sonner";
import BackButton from "@/app/components/BackButton";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  location: string | null;
  image_url: string | null;
  date_start: string;
  max_participants: number | null;
  status: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  event: Event;
  status: string;
  registered_at: string;
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

function getRegistrationStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("pending")) return "text-yellow-500";
  if (lowerStatus.includes("accepted")) return "text-green-500";
  if (lowerStatus.includes("rejected")) return "text-red-500";
  if (lowerStatus.includes("attended")) return "text-blue-500";
  return "text-gray-400";
}

// Cancel Confirmation Modal Component
function CancelConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  isDark,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  isDark: boolean;
  t: (key: string) => string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
          isDark ? "bg-[#0a0f2c] border border-[#1e2a5a]" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3
              className={`text-xl font-semibold ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {t("Cancel Registration")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition ${
              isDark ? "hover:bg-[#1e2a5a]" : "hover:bg-gray-100"
            }`}
          >
            <X
              size={20}
              className={isDark ? "text-gray-400" : "text-gray-500"}
            />
          </button>
        </div>

        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {t("Are you sure you want to cancel your registration for")}{" "}
          <span className="font-semibold text-yellow-500">{eventTitle}</span>?
          <br />
          {t("This action cannot be undone.")}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md transition ${
              isDark
                ? "bg-[#1e2a5a] text-white hover:bg-[#2a3a7a]"
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            {t("Keep Registration")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md transition bg-red-500 text-white hover:bg-red-600"
          >
            {t("Yes, Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Participation() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";

  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"register" | "my">("register");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [registrationToCancel, setRegistrationToCancel] =
    useState<EventRegistration | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ events: Event[] }>(GET_ALL_EVENTS, {
        skip: 0,
        take: 50,
      });

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        toast.error(`API Error: ${result.errors[0].message}`);
        setEvents([]);
        return;
      }

      if (result.data?.events) {
        setEvents(result.data.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error(t("Failed to load events"));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchMyRegistrations = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{
        myEventRegistrations: EventRegistration[];
      }>(GET_MY_EVENT_REGISTRATIONS);
      if (result.data?.myEventRegistrations) {
        setMyRegistrations(result.data.myEventRegistrations);
      }
    } catch (error) {
      console.error("Error fetching my registrations:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, [fetchEvents, fetchMyRegistrations]);

  const handleSelect = (event: Event) => {
    setSelectedEvent(event);
    setOpen(false);
  };

  const handleRegister = async () => {
    if (!selectedEvent) {
      toast.error(t("Please select an event"));
      return;
    }

    setProcessing(true);
    try {
      const result = await fetchGraphQL<{
        registerToEvent: { id: string; status: string };
      }>(REGISTER_TO_EVENT, { input: { event_id: selectedEvent.id } });

      if (result.data?.registerToEvent) {
        toast.success(t("Successfully joined event!"));
        setSelectedEvent(null);
        await fetchMyRegistrations();
        await fetchEvents();
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error(t("Failed to register for event"));
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelClick = (registration: EventRegistration) => {
    setRegistrationToCancel(registration);
    setCancelModalOpen(true);
  };

  const confirmCancelRegistration = async () => {
    if (!registrationToCancel) return;

    setCancelModalOpen(false);
    setProcessing(true);

    try {
      const result = await fetchGraphQL<{ cancelRegistration: boolean }>(
        CANCEL_REGISTRATION,
        { id: registrationToCancel.id },
      );

      if (result.data?.cancelRegistration) {
        toast.success(t("Registration cancelled successfully"));
        await fetchMyRegistrations();
        await fetchEvents();
        setRegistrationToCancel(null);
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error(t("Failed to cancel registration"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-20 transition
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}
    >
      {/* Header with BackButton and Title */}
      <div className="w-full max-w-4xl relative mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </div>
        <h1
          className={`text-3xl italic font-bold text-center
          ${isDark ? "text-[#FFD700]" : "text-yellow-600"}`}
        >
          {t("Participation Event")}
        </h1>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("register")}
          className={`px-6 py-2 rounded-md transition ${
            activeTab === "register"
              ? isDark
                ? "bg-yellow-400 text-black"
                : "bg-[#F0B100] text-black"
              : isDark
              ? "bg-[#0a1128] text-gray-400 hover:text-white"
              : "bg-gray-200 text-gray-600 hover:text-black"
          }`}
        >
          {t("Register for Event")}
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`px-6 py-2 rounded-md transition ${
            activeTab === "my"
              ? isDark
                ? "bg-yellow-400 text-black"
                : "bg-[#F0B100] text-black"
              : isDark
              ? "bg-[#0a1128] text-gray-400 hover:text-white"
              : "bg-gray-200 text-gray-600 hover:text-black"
          }`}
        >
          {t("My Registrations")}
        </button>
      </div>

      {/* Register Tab */}
      {activeTab === "register" && (
        <>
          <div className="w-full max-w-4xl relative">
            <label
              className={`${
                isDark ? "text-gray-300" : "text-gray-600"
              } mb-2 block`}
            >
              {t("Select Event")}
            </label>

            <div
              onClick={() => setOpen(!open)}
              className={`flex items-center justify-between px-5 py-4 rounded-xl cursor-pointer transition
                ${
                  isDark
                    ? "bg-gradient-to-r from-[#0B1E4B] to-[#081633] border border-[#0f2b63] text-gray-300"
                    : "bg-white border border-gray-300 text-black"
                }`}
            >
              <div className="flex items-center gap-3">
                <KeyRound className="text-yellow-500 w-5 h-5" />
                <span>
                  {selectedEvent ? selectedEvent.title : t("Select an event")}
                </span>
              </div>

              <ChevronDown
                className={`text-yellow-500 w-5 h-5 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>

            {open && (
              <div
                className={`absolute w-full mt-2 rounded-xl overflow-hidden shadow-lg max-h-80 overflow-y-auto z-10
                ${
                  isDark
                    ? "bg-[#081633] border border-[#0f2b63]"
                    : "bg-white border border-gray-300"
                }`}
              >
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
                  </div>
                ) : events.length === 0 ? (
                  <div
                    className={`px-5 py-4 text-center ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {t("No events available")}
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleSelect(event)}
                      className={`px-5 py-3 cursor-pointer transition
                        ${
                          isDark
                            ? "text-gray-300 hover:bg-[#0B1E4B]"
                            : "text-black hover:bg-gray-100"
                        }`}
                    >
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <div className="flex gap-3 mt-1 text-xs">
                          <span className="text-yellow-500">
                            {event.event_type}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />{" "}
                            {formatDate(event.date_start, lang)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedEvent && (
            <div
              className={`w-full max-w-4xl mt-6 p-4 rounded-xl
              ${
                isDark
                  ? "bg-[#0a1128] border border-[#0f2b63]"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <h3 className="font-bold mb-2">{t("Event Details")}</h3>
              <p className="text-sm">
                {selectedEvent.description || t("No description available")}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />{" "}
                  {formatDate(selectedEvent.date_start, lang)}
                </span>
                {selectedEvent.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {selectedEvent.location}
                  </span>
                )}
                {selectedEvent.max_participants && (
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {selectedEvent.max_participants}{" "}
                    {t("spots available")}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={!selectedEvent || processing}
            className={`mt-8 w-full max-w-4xl py-4 rounded-xl flex items-center justify-center gap-3 italic text-lg transition
              ${
                !selectedEvent || processing
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
              ${
                isDark
                  ? "bg-[#0B1E4B] border-x-2 border-yellow-400 text-gray-200 hover:bg-[#132a61]"
                  : "bg-yellow-400 text-black hover:bg-yellow-500"
              }`}
          >
            {processing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {t("Register for Event")}
                <KeyRound className="text-yellow-500 w-5 h-5" />
              </>
            )}
          </button>
        </>
      )}

      {/* My Registrations Tab */}
      {activeTab === "my" && (
        <div className="w-full max-w-4xl">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={32} className="animate-spin text-yellow-500" />
            </div>
          ) : myRegistrations.length === 0 ? (
            <div
              className={`text-center py-10 rounded-xl ${
                isDark ? "bg-[#0a1128]" : "bg-white"
              }`}
            >
              <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                {t("No registrations found")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className={`p-4 rounded-xl transition
                  ${
                    isDark
                      ? "bg-[#0a1128] border border-[#0f2b63]"
                      : "bg-white border border-gray-200 shadow"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{reg.event.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        <span className="text-yellow-500">
                          {reg.event.event_type}
                        </span>
                        {reg.event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {reg.event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />{" "}
                          {formatDate(reg.event.date_start, lang)}
                        </span>
                        <span
                          className={`flex items-center gap-1 ${getRegistrationStatusColor(
                            reg.status,
                          )}`}
                        >
                          <CheckCircle size={14} />
                          {reg.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelClick(reg)}
                      disabled={processing}
                      className={`px-4 py-2 rounded-md text-sm font-semibold transition
                      flex items-center gap-2
                      bg-red-500/20 text-red-500 hover:bg-red-500/30 disabled:opacity-50`}
                    >
                      {processing && registrationToCancel?.id === reg.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <XCircle size={16} />
                          {t("Cancel")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CancelConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setRegistrationToCancel(null);
        }}
        onConfirm={confirmCancelRegistration}
        eventTitle={registrationToCancel?.event.title || ""}
        isDark={isDark}
        t={t}
      />
    </div>
  );
}
