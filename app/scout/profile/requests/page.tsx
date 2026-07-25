"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronDown,
  Star,
  X,
  Send,
  XCircle,
  User,
  Filter,
  Loader2,
  MessageSquare,
  Clock,
  Send as SendIcon,
  CheckCircle,
  XCircle as RejectIcon,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import {
  GET_ALL_PLAYERS_FOR_REQUESTS,
  GET_MY_SENT_REQUESTS,
  GET_CLUB_REQUESTS_FOR_ME,
  CAN_CONTACT_PLAYER,
} from "@/app/graphql/query/request.queries";
import {
  SEND_REQUEST_MUTATION,
  CANCEL_REQUEST_MUTATION,
  RESPOND_TO_REQUEST,
} from "@/app/graphql/mutation/request.mutations";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import BackButton from "@/app/components/BackButton";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  average_rating: number;
}

interface ClubRequest {
  id: string;
  status: string;
  message?: string;
  club: {
    id: string;
    user_id: string;
    club_name: string;
    country: string;
    logo_url: string;
  };
  created_at: string;
}

interface SentRequest {
  id: string;
  type: string;
  status: string;
  player_id?: string;
  senderName?: string;
  playerName?: string;
  playerImageUrl?: string;
  payload?: string | { message?: string };
  created_at: string;
  updated_at: string;
}

interface SendRequestResponse {
  sendRequest: SentRequest;
}

interface CancelRequestResponse {
  cancelRequest: SentRequest;
}

interface GetAllPlayersResponse {
  getAllPlayers: {
    data: Player[];
    total: number;
  };
}

interface MySentRequestsResponse {
  mySentRequests: SentRequest[];
}
interface CanContactPlayerResponse {
  canContactPlayer: {
    can_contact: boolean;
    reason: string;
    max_stars: number;
  };
}

const REQUEST_STATUS_TRANSLATIONS: Record<string, Record<string, string>> = {
  PENDING: {
    en: "Pending",
    ar: "قيد الانتظار",
    pt: "Pendente",
    zh: "待处理",
  },
  ACCEPTED: {
    en: "Accepted",
    ar: "مقبول",
    pt: "Aceito",
    zh: "已接受",
  },
  REJECTED: {
    en: "Rejected",
    ar: "مرفوض",
    pt: "Rejeitado",
    zh: "已拒绝",
  },
  CANCELLED: {
    en: "Cancelled",
    ar: "ملغي",
    pt: "Cancelado",
    zh: "已取消",
  },
};

const STATUS_TEXT_TO_KEY: Record<string, string> = {};
Object.entries(REQUEST_STATUS_TRANSLATIONS).forEach(([key, translations]) => {
  Object.values(translations).forEach((text) => {
    STATUS_TEXT_TO_KEY[text.toLowerCase()] = key;
  });
});

const normalizeStatus = (status: string): string => {
  if (!status) return "UNKNOWN";
  const trimmed = status.trim();
  const upper = trimmed.toUpperCase();
  if (["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"].includes(upper)) {
    return upper;
  }
  const matched = STATUS_TEXT_TO_KEY[trimmed.toLowerCase()];
  if (matched) return matched;
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("pend") ||
    lower.includes("قيد") ||
    lower.includes("pendente") ||
    lower.includes("待处理")
  )
    return "PENDING";
  if (
    lower.includes("accept") ||
    lower.includes("مقبول") ||
    lower.includes("aceito") ||
    lower.includes("已接受")
  )
    return "ACCEPTED";
  if (
    lower.includes("reject") ||
    lower.includes("مرفوض") ||
    lower.includes("rejeitado") ||
    lower.includes("已拒绝")
  )
    return "REJECTED";
  if (
    lower.includes("cancell") ||
    lower.includes("ملغي") ||
    lower.includes("cancelado") ||
    lower.includes("已取消")
  )
    return "CANCELLED";
  return "UNKNOWN";
};

const CancelConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDark,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark: boolean;
  t: (key: string) => string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl p-6 relative text-center shadow-2xl transform transition-all duration-300 scale-100 ${
          isDark
            ? "bg-[#0A1A44] border border-[#FFD700]/30"
            : "bg-white border border-gray-200"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? "bg-red-500/20" : "bg-red-100"
            }`}
          >
            <XCircle size={32} className="text-red-500" />
          </div>
          <h2
            className={`text-2xl font-bold italic mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {t("Cancel Request")}
          </h2>
          <p
            className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            } mb-2`}
          >
            {t("Are you sure you want to cancel this request?")}
          </p>
          <p
            className={`text-xs ${
              isDark ? "text-gray-500" : "text-gray-400"
            } mb-6`}
          >
            {t("This action cannot be undone.")}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition ${
                isDark
                  ? "bg-[#0A1A44] border border-gray-600 text-gray-300 hover:bg-[#0F2555]"
                  : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("No, Keep It")}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition"
            >
              {t("Yes, Cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RespondModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  isDark,
  t,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "accept" | "reject";
  isDark: boolean;
  t: (key: string) => string;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-2xl p-6 relative text-center shadow-2xl ${
          isDark
            ? "bg-[#0A1A44] border border-[#FFD700]/30"
            : "bg-white border border-gray-200"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              action === "accept"
                ? isDark
                  ? "bg-green-500/20"
                  : "bg-green-100"
                : isDark
                ? "bg-red-500/20"
                : "bg-red-100"
            }`}
          >
            {action === "accept" ? (
              <CheckCircle size={32} className="text-green-500" />
            ) : (
              <RejectIcon size={32} className="text-red-500" />
            )}
          </div>
          <h2
            className={`text-2xl font-bold italic mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {action === "accept" ? t("Accept Request") : t("Reject Request")}
          </h2>
          <p
            className={`text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            } mb-6`}
          >
            {action === "accept"
              ? t("Are you sure you want to accept this request?")
              : t("Are you sure you want to reject this request?")}
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition ${
                isDark
                  ? "bg-[#0A1A44] border border-gray-600 text-gray-300 hover:bg-[#0F2555]"
                  : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("Cancel")}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition ${
                action === "accept"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading
                ? t("Processing...")
                : action === "accept"
                ? t("Accept")
                : t("Reject")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getFullImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function ScoutRequestsPage() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const [activeTab, setActiveTab] = useState<"send" | "clubRequests" | "sent">(
    "send",
  );
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [clubRequests, setClubRequests] = useState<ClubRequest[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [details, setDetails] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [selectedClubRequest, setSelectedClubRequest] =
    useState<ClubRequest | null>(null);
  const [respondAction, setRespondAction] = useState<"accept" | "reject">(
    "accept",
  );
  const [responding, setResponding] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openPlayers, setOpenPlayers] = useState(false);

  const matchesStatus = (status: string, target: string): boolean => {
    if (target === "ALL") return true;
    return normalizeStatus(status) === target;
  };

  const getTranslatedStatus = (status: string): string => {
    const key = normalizeStatus(status);
    return REQUEST_STATUS_TRANSLATIONS[key]?.[lang] || status;
  };

  const fetchPlayers = useCallback(async () => {
    try {
      const result = await fetchGraphQL<GetAllPlayersResponse>(
        GET_ALL_PLAYERS_FOR_REQUESTS,
        { skip: 0, take: 50 },
      );
      if (result.data?.getAllPlayers?.data) {
        setPlayers(result.data.getAllPlayers.data);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }, []);

  const fetchSentRequests = useCallback(async () => {
    try {
      const result = await fetchGraphQL<MySentRequestsResponse>(
        GET_MY_SENT_REQUESTS,
        {},
      );
      if (result.data?.mySentRequests) {
        setSentRequests(result.data.mySentRequests);
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error);
      setSentRequests([]);
    }
  }, []);

  const fetchClubRequests = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ clubRequestsForMe: ClubRequest[] }>(
        GET_CLUB_REQUESTS_FOR_ME,
        {},
      );
      if (result.data?.clubRequestsForMe) {
        setClubRequests(result.data.clubRequestsForMe);
      } else {
        setClubRequests([]);
      }
    } catch (error) {
      console.error("Error fetching club requests:", error);
      setClubRequests([]);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoadingRequests(true);
    await Promise.all([
      fetchPlayers(),
      fetchSentRequests(),
      fetchClubRequests(),
    ]);
    setLoadingRequests(false);
  }, [fetchPlayers, fetchSentRequests, fetchClubRequests]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getFilteredSentRequests = () => {
    let requests = sentRequests;

    if (statusFilter !== "ALL") {
      requests = requests.filter((r) => matchesStatus(r.status, statusFilter));
    }

    return requests.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  };

  const getFilteredClubRequests = () => {
    let requests = clubRequests;

    if (statusFilter !== "ALL") {
      requests = requests.filter((r) => matchesStatus(r.status, statusFilter));
    }

    return requests.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  };

  const getPayloadMessage = (
    payload: string | { message?: string } | undefined,
  ): string => {
    if (!payload) return t("No message");
    if (typeof payload === "string") return payload;
    if (typeof payload === "object" && payload.message) return payload.message;
    return t("No message");
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTargetId) {
      toast.error(t("Please select a player"));
      return;
    }

    setLoading(true);

    try {
      const contactCheck = await fetchGraphQL<CanContactPlayerResponse>(
        CAN_CONTACT_PLAYER,
        {
          playerId: selectedTargetId,
        },
      );

      if (contactCheck.errors) {
        toast.error(contactCheck.errors[0].message);
        return;
      }

      const canContact = contactCheck.data?.canContactPlayer;

      if (!canContact) {
        toast.error(t("Unable to verify player contact"));
        return;
      }

      if (!canContact.can_contact) {
        toast.error(canContact.reason);
        return;
      }

      const result = await fetchGraphQL<SendRequestResponse>(
        SEND_REQUEST_MUTATION,
        {
          input: {
            player_id: selectedTargetId,
            type: "SCOUT_OFFER",
            message: details || null,
          },
        },
      );

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data?.sendRequest) {
        setSelectedTargetId("");
        setDetails("");

        await fetchAllData();

        toast.success(t("Request sent successfully!"));
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error(t("Failed to send request"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCancelModalOpen(true);
  };

  const confirmCancelRequest = async () => {
    if (!selectedRequestId) return;

    setCancelModalOpen(false);
    try {
      const result = await fetchGraphQL<CancelRequestResponse>(
        CANCEL_REQUEST_MUTATION,
        {
          requestId: selectedRequestId,
        },
      );

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data?.cancelRequest) {
        toast.success(t("Request cancelled successfully"));
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error(t("Failed to cancel request"));
    } finally {
      setSelectedRequestId(null);
    }
  };

  const handleRespondToClubRequest = async (
    requestId: string,
    action: "accept" | "reject",
  ) => {
    setResponding(true);
    try {
      const result = await fetchGraphQL<{
        respondToRequest: {
          id: string;
          type: string;
          status: string;
          sender_role: string;
          senderName: string;
          playerName: string;
          created_at: string;
        };
      }>(RESPOND_TO_REQUEST, {
        input: {
          request_id: requestId,
          accept: action === "accept",
        },
      });

      console.log("📋 Respond response:", result);

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data?.respondToRequest) {
        toast.success(
          action === "accept"
            ? t("Request accepted successfully!")
            : t("Request rejected successfully!"),
        );
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error responding to request:", error);
      toast.error(t("Failed to respond to request"));
    } finally {
      setResponding(false);
      setRespondModalOpen(false);
      setSelectedClubRequest(null);
    }
  };

  const openRespondModal = (
    request: ClubRequest,
    action: "accept" | "reject",
  ) => {
    setSelectedClubRequest(request);
    setRespondAction(action);
    setRespondModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "PENDING":
        return "text-yellow-500 bg-yellow-500/10";
      case "ACCEPTED":
        return "text-green-500 bg-green-500/10";
      case "REJECTED":
        return "text-red-500 bg-red-500/10";
      case "CANCELLED":
        return "text-gray-500 bg-gray-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusLabel = (status: string) => {
    const key = normalizeStatus(status);
    switch (key) {
      case "PENDING":
        return t("Pending");
      case "ACCEPTED":
        return t("Accepted");
      case "REJECTED":
        return t("Rejected");
      case "CANCELLED":
        return t("Cancelled");
      default:
        return t("All Statuses");
    }
  };

  const getSentStatusCount = (status: string) => {
    if (status === "ALL") return sentRequests.length;
    return sentRequests.filter((r) => matchesStatus(r.status, status)).length;
  };

  const getClubStatusCount = (status: string) => {
    if (status === "ALL") return clubRequests.length;
    return clubRequests.filter((r) => matchesStatus(r.status, status)).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
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
  };

  const selectedPlayer = players.find((p) => p.id === selectedTargetId);

  const getNoRequestsMessage = (tab: string, status: string) => {
    if (tab === "clubRequests") {
      if (status === "ALL") return t("No club requests");
      if (status === "PENDING") return t("No pending requests found");
      if (status === "ACCEPTED") return t("No accepted requests found");
      if (status === "REJECTED") return t("No rejected requests found");
      if (status === "CANCELLED") return t("No cancelled requests found");
      return t("No club requests");
    }
    if (tab === "sent") {
      if (status === "ALL") return t("No sent requests");
      if (status === "PENDING") return t("No pending requests found");
      if (status === "ACCEPTED") return t("No accepted requests found");
      if (status === "REJECTED") return t("No rejected requests found");
      if (status === "CANCELLED") return t("No cancelled requests found");
      return t("No sent requests");
    }
    return t("No requests found");
  };

  return (
    <div
      className={`min-h-screen p-6 md:p-12 flex justify-center font-sans relative transition ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <CancelConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedRequestId(null);
        }}
        onConfirm={confirmCancelRequest}
        isDark={isDark}
        t={t}
      />

      <RespondModal
        isOpen={respondModalOpen}
        onClose={() => {
          setRespondModalOpen(false);
          setSelectedClubRequest(null);
        }}
        onConfirm={() => {
          if (selectedClubRequest) {
            handleRespondToClubRequest(selectedClubRequest.id, respondAction);
          }
        }}
        action={respondAction}
        isDark={isDark}
        t={t}
        loading={responding}
      />

      <div className="max-w-6xl w-full space-y-8 py-20">
        <BackButton className="mb-6" />

        <h1
          className={`text-center text-4xl font-black italic uppercase mb-10 ${
            isDark ? "text-[#FFD700]" : "text-yellow-600"
          } ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("Scout Requests")}
        </h1>

        <div
          className={`flex justify-center gap-4 mb-8 flex-wrap ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <button
            onClick={() => setActiveTab("send")}
            className={`px-6 py-2 rounded-md font-semibold transition flex items-center gap-2 ${
              activeTab === "send"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-yellow-500 text-white"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            } ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <SendIcon size={16} />
            {t("Send Request to Player")}
          </button>
          <button
            onClick={() => setActiveTab("clubRequests")}
            className={`px-6 py-2 rounded-md font-semibold transition flex items-center gap-2 ${
              activeTab === "clubRequests"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-yellow-500 text-white"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            } ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Building2 size={16} />
            {t("Club Requests")}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-6 py-2 rounded-md font-semibold transition flex items-center gap-2 ${
              activeTab === "sent"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-yellow-500 text-white"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            } ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Send size={16} />
            {t("Sent Requests")}
          </button>
        </div>

        {/* Send Request Tab - to Player */}
        {activeTab === "send" && (
          <form onSubmit={handleSendRequest} className="space-y-8">
            <div className="space-y-3">
              <label
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } text-sm uppercase font-semibold ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Select Player")} *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenPlayers(!openPlayers)}
                  className={`w-full rounded-xl py-4 px-4 flex items-center justify-between transition ${
                    isDark
                      ? "bg-[#0A1A44]/40 border border-blue-900/50 text-white"
                      : "bg-white border border-gray-300 text-black"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Star
                      size={18}
                      className="text-[#FFD700]"
                      fill="currentColor"
                    />
                    <span>
                      {selectedPlayer
                        ? `${selectedPlayer.first_name} ${selectedPlayer.last_name}`
                        : t("Select Player")}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      openPlayers ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openPlayers && (
                  <div
                    className={`absolute top-full left-0 mt-2 w-full rounded-xl overflow-hidden z-50 max-h-72 overflow-y-auto shadow-xl ${
                      isDark
                        ? "bg-[#0A1A44] border border-blue-900/50"
                        : "bg-white border border-gray-300"
                    }`}
                  >
                    {players.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => {
                          setSelectedTargetId(player.id);
                          setOpenPlayers(false);
                        }}
                        className={`w-full p-3 text-left flex items-center gap-3 transition ${
                          selectedTargetId === player.id
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "hover:bg-yellow-500/10"
                        } ${isRTL ? "flex-row-reverse text-right" : ""}`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                          {player.profile_image_url ? (
                            <Image
                              src={getFullImageUrl(player.profile_image_url)}
                              alt={player.first_name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={14} className="text-gray-500" />
                          )}
                        </div>
                        <span>
                          {player.first_name} {player.last_name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedPlayer && (
                <div
                  className={`p-3 rounded-lg flex items-center justify-between transition mt-4 ${
                    isDark
                      ? "bg-[#051139]/50 border border-blue-900/30"
                      : "bg-white shadow"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex items-center gap-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="w-12 h-12 relative rounded-md overflow-hidden">
                      {selectedPlayer.profile_image_url ? (
                        <Image
                          src={getFullImageUrl(
                            selectedPlayer.profile_image_url,
                          )}
                          alt={selectedPlayer.first_name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-player.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <h4 className="text-sm font-bold">
                        {selectedPlayer.first_name} {selectedPlayer.last_name}
                      </h4>
                      <p
                        className={`${
                          isDark ? "text-gray-500" : "text-gray-400"
                        } text-xs`}
                      >
                        {t("Player")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <textarea
              rows={6}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t("Message to Player (optional)")}
              className={`w-full rounded-xl p-4 outline-none resize-none ${
                isDark
                  ? "bg-[#0A1A44]/40 border border-blue-900/50 text-white placeholder:text-gray-500"
                  : "bg-white border border-gray-300 text-black placeholder:text-gray-400"
              } ${isRTL ? "text-right" : "text-left"}`}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition ${
                isDark
                  ? "bg-[#0A1A44] border border-[#FFD700]/40 text-white hover:bg-[#FFD700] hover:text-black"
                  : "bg-yellow-400 text-black hover:bg-yellow-500"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""} ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <span className="font-bold uppercase">
                {loading ? t("Sending...") : t("Send Request")}
              </span>
              <Send size={20} />
            </button>
          </form>
        )}

        {/* Club Requests Tab - from Clubs */}
        {activeTab === "clubRequests" && (
          <div className="space-y-4">
            <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isDark
                      ? "bg-[#0a0f2c] border border-[#1e2a5a] hover:bg-[#1e2a5a]"
                      : "bg-white border border-gray-200 shadow hover:bg-gray-50"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Filter size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">
                    {getStatusLabel(statusFilter)}
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
                      className={`absolute top-full ${
                        isRTL ? "left-0" : "right-0"
                      } mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-20 ${
                        isDark
                          ? "bg-[#0a0f2c] border border-[#1e2a5a]"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {[
                        "ALL",
                        "PENDING",
                        "ACCEPTED",
                        "REJECTED",
                        "CANCELLED",
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition flex items-center justify-between ${
                            statusFilter === status
                              ? isDark
                                ? "bg-yellow-400/20 text-yellow-400"
                                : "bg-yellow-50 text-yellow-600"
                              : isDark
                              ? "hover:bg-[#1e2a5a] text-gray-300"
                              : "hover:bg-gray-50 text-gray-700"
                          } ${isRTL ? "flex-row-reverse text-right" : ""}`}
                        >
                          <span
                            className={`flex items-center gap-2 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                status === "PENDING"
                                  ? "bg-yellow-500"
                                  : status === "ACCEPTED"
                                  ? "bg-green-500"
                                  : status === "REJECTED"
                                  ? "bg-red-500"
                                  : status === "CANCELLED"
                                  ? "bg-gray-500"
                                  : "bg-gray-400"
                              }`}
                            ></span>
                            {getStatusLabel(status)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20">
                            {getClubStatusCount(status)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {loadingRequests ? (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-yellow-500" />
              </div>
            ) : getFilteredClubRequests().length === 0 ? (
              <div
                className={`text-center py-20 rounded-xl ${
                  isDark ? "bg-[#0a1128]" : "bg-white shadow"
                }`}
              >
                <Building2 size={48} className="mx-auto mb-4 text-gray-500" />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {getNoRequestsMessage("clubRequests", statusFilter)}
                </p>
              </div>
            ) : (
              getFilteredClubRequests().map((request) => {
                const displayStatus = getTranslatedStatus(request.status);
                return (
                  <div
                    key={request.id}
                    className={`p-5 rounded-xl transition ${
                      isDark
                        ? "bg-[#0A1A44]/40 border border-blue-900/30"
                        : "bg-white shadow"
                    } ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <div
                      className={`flex justify-between items-start gap-4 flex-wrap ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div
                          className={`flex items-center gap-3 mb-2 flex-wrap ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              request.status,
                            )}`}
                          >
                            {displayStatus}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          {request.club.logo_url && (
                            <div className="w-8 h-8 relative rounded-full overflow-hidden">
                              <Image
                                src={getFullImageUrl(request.club.logo_url)}
                                alt={request.club.club_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <h3 className="font-bold text-lg">
                            {request.club.club_name}
                          </h3>
                        </div>
                        {request.message && (
                          <p
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            } mt-2 ${isRTL ? "text-right" : "text-left"}`}
                          >
                            <MessageSquare size={14} className="inline mr-1" />
                            {request.message}
                          </p>
                        )}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          } mt-2 flex items-center gap-1 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Clock size={12} />
                          {formatDate(request.created_at)}
                        </p>
                      </div>
                      <div
                        className={`flex gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        {normalizeStatus(request.status) === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                openRespondModal(request, "accept")
                              }
                              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition whitespace-nowrap"
                            >
                              {t("Accept")}
                            </button>
                            <button
                              onClick={() =>
                                openRespondModal(request, "reject")
                              }
                              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition whitespace-nowrap"
                            >
                              {t("Reject")}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === "sent" && (
          <div className="space-y-4">
            <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isDark
                      ? "bg-[#0a0f2c] border border-[#1e2a5a] hover:bg-[#1e2a5a]"
                      : "bg-white border border-gray-200 shadow hover:bg-gray-50"
                  } ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Filter size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">
                    {getStatusLabel(statusFilter)}
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
                      className={`absolute top-full ${
                        isRTL ? "left-0" : "right-0"
                      } mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-20 ${
                        isDark
                          ? "bg-[#0a0f2c] border border-[#1e2a5a]"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {[
                        "ALL",
                        "PENDING",
                        "ACCEPTED",
                        "REJECTED",
                        "CANCELLED",
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition flex items-center justify-between ${
                            statusFilter === status
                              ? isDark
                                ? "bg-yellow-400/20 text-yellow-400"
                                : "bg-yellow-50 text-yellow-600"
                              : isDark
                              ? "hover:bg-[#1e2a5a] text-gray-300"
                              : "hover:bg-gray-50 text-gray-700"
                          } ${isRTL ? "flex-row-reverse text-right" : ""}`}
                        >
                          <span
                            className={`flex items-center gap-2 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                status === "PENDING"
                                  ? "bg-yellow-500"
                                  : status === "ACCEPTED"
                                  ? "bg-green-500"
                                  : status === "REJECTED"
                                  ? "bg-red-500"
                                  : status === "CANCELLED"
                                  ? "bg-gray-500"
                                  : "bg-gray-400"
                              }`}
                            ></span>
                            {getStatusLabel(status)}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20">
                            {getSentStatusCount(status)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {loadingRequests ? (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-yellow-500" />
              </div>
            ) : getFilteredSentRequests().length === 0 ? (
              <div
                className={`text-center py-20 rounded-xl ${
                  isDark ? "bg-[#0a1128]" : "bg-white shadow"
                }`}
              >
                <Send size={48} className="mx-auto mb-4 text-gray-500" />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {getNoRequestsMessage("sent", statusFilter)}
                </p>
              </div>
            ) : (
              getFilteredSentRequests().map((request) => {
                const playerImage = getFullImageUrl(request.playerImageUrl);
                const displayStatus = getTranslatedStatus(request.status);
                return (
                  <div
                    key={request.id}
                    className={`p-5 rounded-xl transition ${
                      isDark
                        ? "bg-[#0A1A44]/40 border border-blue-900/30"
                        : "bg-white shadow"
                    } ${isRTL ? "text-right" : "text-left"}`}
                  >
                    <div
                      className={`flex justify-between items-start gap-4 flex-wrap ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div
                          className={`flex items-center gap-3 mb-2 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          {playerImage && (
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-yellow-500/30">
                              <Image
                                src={playerImage}
                                alt={request.playerName || "Player"}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              request.status,
                            )}`}
                          >
                            {displayStatus}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg">
                          {request.playerName || t("Player")}
                        </h3>
                        {request.payload && (
                          <p
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            } mt-2 ${isRTL ? "text-right" : "text-left"}`}
                          >
                            <MessageSquare size={14} className="inline mr-1" />
                            {getPayloadMessage(request.payload)}
                          </p>
                        )}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          } mt-2 flex items-center gap-1 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <Clock size={12} />
                          {formatDate(request.created_at)}
                        </p>
                      </div>
                      <div
                        className={`flex gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        {normalizeStatus(request.status) === "PENDING" && (
                          <button
                            onClick={() => handleCancelClick(request.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition whitespace-nowrap"
                          >
                            {t("Cancel")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
