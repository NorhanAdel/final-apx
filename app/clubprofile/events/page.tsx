"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  XCircle,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { uploadGraphQL } from "../../lib/uploadGraphQL";
import { GET_MY_EVENTS } from "@/app/graphql/query/event.queries";
import {
  CREATE_EVENT,
  UPDATE_EVENT,
  DELETE_EVENT,
  CANCEL_EVENT,
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
  date_end: string | null;
  max_participants: number | null;
  status: string;
  organizer_id: string;
  sport_id: string;
  created_at: string;
  updated_at: string;
}

interface Sport {
  id: string;
  name: string;
}

interface Registration {
  id: string;
  status: string;
  player_id: string;
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

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function getEventStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "upcoming") return "text-blue-500";
  if (lowerStatus === "ongoing") return "text-green-500";
  if (lowerStatus === "completed") return "text-gray-500";
  if (lowerStatus === "cancelled") return "text-red-500";
  return "text-gray-400";
}

function getRegistrationStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "pending") return "text-yellow-500";
  if (lowerStatus === "accepted") return "text-green-500";
  if (lowerStatus === "rejected") return "text-red-500";
  return "text-gray-400";
}

const DeleteConfirmModal = ({
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-xl p-6 shadow-xl ${
          isDark ? "bg-[#0a0f2c] border border-[#1e2a5a]" : "bg-white"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h3
            className={`text-xl font-semibold ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            {t("Delete Event")}
          </h3>
        </div>

        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {t("Are you sure you want to delete")}{" "}
          <span className="font-semibold text-yellow-500">{eventTitle}</span>?
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
            {t("Cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md transition bg-red-500 text-white hover:bg-red-600"
          >
            {t("Delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistrationsModal = ({
  isOpen,
  onClose,
  registrations,
  eventTitle,
  isDark,
  t,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  registrations: Registration[];
  eventTitle: string;
  isDark: boolean;
  t: (key: string) => string;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-xl p-6 max-h-[80vh] overflow-y-auto
          ${isDark ? "bg-[#0a0f2c] border border-[#1e2a5a]" : "bg-white"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-bold ${
              isDark ? "text-white" : "text-black"
            }`}
          >
            {t("Registrations for")} {eventTitle}
          </h2>
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

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={32} className="animate-spin text-yellow-500" />
          </div>
        ) : registrations.length === 0 ? (
          <div
            className={`text-center py-10 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t("No registrations yet")}
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className={`p-3 rounded-lg flex items-center justify-between
                  ${
                    isDark
                      ? "bg-[#0b1736] border border-[#1e2a5a]"
                      : "bg-gray-50 border border-gray-200"
                  }`}
              >
                <div>
                  <p
                    className={`font-medium ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {t("Player ID")}: {reg.player_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(reg.registered_at, "en")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getRegistrationStatusColor(
                    reg.status,
                  )} bg-opacity-10`}
                >
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ClubEvents() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"create" | "my">("my");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "TOURNAMENT",
    sport_id: "",
    location: "",
    date_start: "",
    date_end: "",
    max_participants: "",
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ myEvents: Event[] }>(GET_MY_EVENTS);
      if (result.data?.myEvents) {
        setEvents(result.data.myEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error(t("Failed to load events"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchSports = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ sports: Sport[] }>(
        `query GetSports { sports { id name } }`,
      );
      if (result.data?.sports) {
        setSports(result.data.sports);
      }
    } catch (error) {
      console.error("Error fetching sports:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchSports();
  }, [fetchEvents, fetchSports]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = t("Title is required");
    }
    if (!formData.sport_id) {
      newErrors.sport_id = t("Please select a sport");
    }
    if (!formData.date_start) {
      newErrors.date_start = t("Start date is required");
    }
    if (formData.date_start && formData.date_end) {
      if (new Date(formData.date_start) >= new Date(formData.date_end)) {
        newErrors.date_end = t("End date must be after start date");
      }
    }
    if (formData.max_participants && parseInt(formData.max_participants) < 1) {
      newErrors.max_participants = t("Max participants must be at least 1");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_type: "TOURNAMENT",
      sport_id: "",
      location: "",
      date_start: "",
      date_end: "",
      max_participants: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

const handleViewRegistrations = (event: Event) => {
  router.push(`/clubprofile/events/registrations/${event.id}`);
};
  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      sport_id: event.sport_id,
      location: event.location || "",
      date_start: formatDateTime(event.date_start),
      date_end: event.date_end ? formatDateTime(event.date_end) : "",
      max_participants: event.max_participants?.toString() || "",
    });
    if (event.image_url) {
      const url = event.image_url.startsWith("http")
        ? event.image_url
        : `${process.env.NEXT_PUBLIC_API_URL}${event.image_url}`;
      setImagePreview(url);
    }
    setErrors({});
    setActiveTab("create");
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    setProcessing(true);
    try {
      const result = await fetchGraphQL<{ deleteEvent: boolean }>(
        DELETE_EVENT,
        { id: eventToDelete.id },
      );

      if (result.data?.deleteEvent) {
        toast.success(t("Event deleted successfully"));
        fetchEvents();
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(t("Failed to delete event"));
    } finally {
      setProcessing(false);
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  const handleCancelEvent = async (event: Event) => {
    setProcessing(true);
    try {
      const result = await fetchGraphQL<{ cancelEvent: Event }>(CANCEL_EVENT, {
        id: event.id,
      });

      if (result.data?.cancelEvent) {
        toast.success(t("Event cancelled successfully"));
        fetchEvents();
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch (error) {
      console.error("Error cancelling event:", error);
      toast.error(t("Failed to cancel event"));
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("Please fix the errors in the form"));
      return;
    }

    setProcessing(true);

    const input = {
      title: formData.title,
      description: formData.description || undefined,
      event_type: formData.event_type,
      sport_id: formData.sport_id,
      location: formData.location || undefined,
      date_start: new Date(formData.date_start).toISOString(),
      date_end: formData.date_end
        ? new Date(formData.date_end).toISOString()
        : undefined,
      max_participants: formData.max_participants
        ? parseInt(formData.max_participants)
        : undefined,
    };

    try {
      let result;

      if (selectedEvent) {
        const variables: Record<string, unknown> = {
          id: selectedEvent.id,
          input,
        };
        if (imageFile) {
          variables.image = imageFile;
        }

        result = await uploadGraphQL<{ updateEvent: Event }>(
          UPDATE_EVENT,
          variables,
        );
      } else {
        const variables: Record<string, unknown> = { input };
        if (imageFile) {
          variables.image = imageFile;
        }

        result = await uploadGraphQL<{ createEvent: Event }>(
          CREATE_EVENT,
          variables,
        );
      }

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data) {
        toast.success(
          selectedEvent
            ? t("Event updated successfully")
            : t("Event created successfully"),
        );
        resetForm();
        setSelectedEvent(null);
        fetchEvents();
        setActiveTab("my");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(t("Failed to save event"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-40 px-6 transition
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}
    >
      <div className="max-w-6xl mx-auto">
        <BackButton className="mb-6" />

        <h1 className="text-4xl font-black italic tracking-tighter text-yellow-400 uppercase text-center mb-10">
          {t("Events")}
        </h1>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab("create");
              setSelectedEvent(null);
              resetForm();
            }}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              activeTab === "create"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-[#F0B100] text-black"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            {t("Create Event")}
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              activeTab === "my"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-[#F0B100] text-black"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            {t("My Events")}
          </button>
        </div>

        {activeTab === "create" ? (
          <div
            className={`rounded-xl p-6 ${
              isDark
                ? "bg-[#0a0f2c] border border-[#1e2a5a]"
                : "bg-white shadow"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {selectedEvent ? t("Edit Event") : t("Create New Event")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Title")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg px-4 py-2 outline-none border transition
                    ${
                      isDark
                        ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                        : "bg-white border-gray-300 text-black focus:border-yellow-400"
                    } ${errors.title ? "border-red-500" : ""}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Description")}
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg px-4 py-2 outline-none border resize-none
                    ${
                      isDark
                        ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                        : "bg-white border-gray-300 text-black focus:border-yellow-400"
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("Event Type")}
                  </label>
                  <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg px-4 py-2 outline-none border
                      ${
                        isDark
                          ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                          : "bg-white border-gray-300 text-black focus:border-yellow-400"
                      }`}
                  >
                    <option value="TOURNAMENT">{t("Tournament")}</option>
                    <option value="CAMP">{t("Camp")}</option>
                    <option value="TRAINING">{t("Training")}</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("Sport")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sport_id"
                    value={formData.sport_id}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg px-4 py-2 outline-none border
                      ${
                        isDark
                          ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                          : "bg-white border-gray-300 text-black focus:border-yellow-400"
                      } ${errors.sport_id ? "border-red-500" : ""}`}
                  >
                    <option value="">{t("Select Sport")}</option>
                    {sports.map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                  {errors.sport_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.sport_id}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Location")}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg px-4 py-2 outline-none border
                    ${
                      isDark
                        ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                        : "bg-white border-gray-300 text-black focus:border-yellow-400"
                    }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("Start Date")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="date_start"
                    value={formData.date_start}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg px-4 py-2 outline-none border
                      ${
                        isDark
                          ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                          : "bg-white border-gray-300 text-black focus:border-yellow-400"
                      } ${errors.date_start ? "border-red-500" : ""}`}
                  />
                  {errors.date_start && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.date_start}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("End Date")}
                  </label>
                  <input
                    type="datetime-local"
                    name="date_end"
                    value={formData.date_end}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg px-4 py-2 outline-none border
                      ${
                        isDark
                          ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                          : "bg-white border-gray-300 text-black focus:border-yellow-400"
                      } ${errors.date_end ? "border-red-500" : ""}`}
                  />
                  {errors.date_end && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.date_end}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Max Participants")}
                </label>
                <input
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg px-4 py-2 outline-none border
                    ${
                      isDark
                        ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                        : "bg-white border-gray-300 text-black focus:border-yellow-400"
                    } ${errors.max_participants ? "border-red-500" : ""}`}
                />
                {errors.max_participants && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.max_participants}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Event Image")}
                </label>
                <div
                  onClick={() =>
                    document.getElementById("event-image")?.click()
                  }
                  className={`relative w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition overflow-hidden
                    ${
                      isDark
                        ? "border-yellow-400/30 bg-[#0b1736] hover:bg-[#0f1f4a]"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                >
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Plus size={32} className="text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">
                        {t("Click to upload image")}
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="event-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setSelectedEvent(null);
                    setActiveTab("my");
                  }}
                  className={`flex-1 py-2 rounded-md transition
                    ${
                      isDark
                        ? "bg-[#1e2a5a] text-white hover:bg-[#2a3a7a]"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`flex-1 py-2 rounded-md transition
                    ${
                      isDark
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : "bg-[#F0B100] text-black hover:bg-yellow-500"
                    } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {processing ? (
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  ) : selectedEvent ? (
                    t("Update")
                  ) : (
                    t("Create")
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-yellow-500" />
              </div>
            ) : events.length === 0 ? (
              <div
                className={`text-center py-20 rounded-xl ${
                  isDark ? "bg-[#0a1128]" : "bg-white"
                }`}
              >
                <Trophy size={48} className="mx-auto mb-4 text-gray-500" />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {t("No events created yet")}
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className={`mt-4 px-4 py-2 rounded-md transition
                    ${
                      isDark
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : "bg-[#F0B100] text-black hover:bg-yellow-500"
                    }`}
                >
                  {t("Create your first event")}
                </button>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl transition ${
                    isDark
                      ? "bg-[#0a1128] border border-[#0f2b63]"
                      : "bg-white border border-gray-200 shadow"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getEventStatusColor(
                            event.status,
                          )} bg-opacity-10`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-yellow-500">
                          {event.event_type}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {event.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />{" "}
                          {formatDate(event.date_start, lang)}
                        </span>
                        {event.max_participants && (
                          <span className="flex items-center gap-1">
                            <Users size={14} /> {event.max_participants}{" "}
                            {t("spots")}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p
                          className={`text-sm mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {event.description.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewRegistrations(event)}
                        className={`p-2 rounded-md transition ${
                          isDark ? "hover:bg-blue-500/20" : "hover:bg-gray-100"
                        }`}
                        title={t("View Registrations")}
                      >
                        <Eye size={18} className="text-blue-500" />
                      </button>
                      {event.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleCancelEvent(event)}
                          disabled={processing}
                          className={`p-2 rounded-md transition ${
                            isDark ? "hover:bg-red-500/20" : "hover:bg-gray-100"
                          }`}
                          title={t("Cancel Event")}
                        >
                          <XCircle size={18} className="text-red-500" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(event)}
                        className={`p-2 rounded-md transition ${
                          isDark
                            ? "hover:bg-yellow-400/20"
                            : "hover:bg-gray-100"
                        }`}
                        title={t("Edit Event")}
                      >
                        <Edit size={18} className="text-yellow-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event)}
                        className={`p-2 rounded-md transition ${
                          isDark ? "hover:bg-red-500/20" : "hover:bg-gray-100"
                        }`}
                        title={t("Delete Event")}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        onConfirm={confirmDelete}
        eventTitle={eventToDelete?.title || ""}
        isDark={isDark}
        t={t}
      />

      <RegistrationsModal
        isOpen={registrationsModalOpen}
        onClose={() => {
          setRegistrationsModalOpen(false);
          setSelectedEvent(null);
          setRegistrations([]);
        }}
        registrations={registrations}
        eventTitle={selectedEvent?.title || ""}
        isDark={isDark}
        t={t}
        loading={loadingRegistrations}
      />
    </div>
  );
}
