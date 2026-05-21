"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronDown,
  Star,
  LogOut,
  X,
  Send,
  XCircle,
  User,
  Filter,
  Loader2,
  MessageSquare,
  Clock,
  Send as SendIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  GET_ALL_PLAYERS_FOR_REQUESTS,
  GET_MY_SENT_REQUESTS,
  CAN_CONTACT_PLAYER,
} from "@/app/graphql/query/request.queries";
import {
  SEND_REQUEST_MUTATION,
  CANCEL_REQUEST_MUTATION,
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

interface SentRequest {
  id: string;
  type: string;
  status: string;
  player_id?: string;
  senderName?: string;
  playerName?: string;
  payload?: string | { message?: string };
  created_at: string;
  updated_at: string;
}

interface SendRequestResponse {
  sendRequest: SentRequest;
}
interface CanContactPlayerResponse {
  canContactPlayer: {
    can_contact: boolean;
    reason?: string;
    max_stars?: number;
  };
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

export default function AgentRequests() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"send" | "sent">("send");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [details, setDetails] = useState("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const fetchAllData = useCallback(async () => {
    setLoadingRequests(true);
    await Promise.all([fetchPlayers(), fetchSentRequests()]);
    setLoadingRequests(false);
  }, [fetchPlayers, fetchSentRequests]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getFilteredRequests = () => {
    let requests = sentRequests;

    if (statusFilter !== "ALL") {
      requests = requests.filter(
        (r) => r.status?.toUpperCase() === statusFilter,
      );
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
    // check permission first
    const permissionResult =
      await fetchGraphQL<CanContactPlayerResponse>(
        CAN_CONTACT_PLAYER,
        {
          playerId: selectedTargetId,
        },
      );

    const permission = permissionResult.data?.canContactPlayer;

    if (!permission?.can_contact) {
      toast.error(
        permission?.reason ||
          t("Your package does not allow contacting this player"),
      );

      setLoading(false);
      return;
    }

    // send request
    const result = await fetchGraphQL<SendRequestResponse>(
      SEND_REQUEST_MUTATION,
      {
        input: {
          player_id: selectedTargetId,
          type: "AGENT_REQUEST",
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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
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
    switch (status) {
      case "ALL":
        return t("All Statuses");
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

  const getStatusCount = (status: string) => {
    if (status === "ALL") return sentRequests.length;
    return sentRequests.filter((r) => r.status?.toUpperCase() === status)
      .length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const selectedPlayer = players.find((p) => p.id === selectedTargetId);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div
      className={`min-h-screen p-6 md:p-12 flex justify-center font-sans relative transition ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
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

      {showLogoutModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-xl p-10 relative text-center ${
              isDark ? "bg-[#050B18]" : "bg-white"
            }`}
          >
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X size={20} />
            </button>
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-3xl font-black italic uppercase">
                {t("Logout")}
              </h2>
              <LogOut size={28} />
            </div>
            <p
              className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-10`}
            >
              {t("Are You Sure You Want To Log out?")}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 py-3 rounded-md ${
                  isDark ? "bg-[#0A1A44] text-white" : "bg-gray-200 text-black"
                }`}
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-md"
              >
                {t("Logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full space-y-8 py-20">
        <BackButton className="mb-6" />
        
        <h1
          className={`text-center text-4xl font-black italic uppercase mb-10 ${
            isDark ? "text-[#FFD700]" : "text-yellow-600"
          }`}
        >
          {t("Agent Requests")}
        </h1>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("send")}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              activeTab === "send"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-yellow-500 text-white"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            <SendIcon size={16} className="inline mr-2" />
            {t("Send Request")}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              activeTab === "sent"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-yellow-500 text-white"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            <SendIcon size={16} className="inline mr-2" />
            {t("My Sent Requests")}
          </button>
        </div>

        {activeTab === "send" ? (
          <form onSubmit={handleSendRequest} className="space-y-8">
            <div className="space-y-3">
              <label
                className={`${
                  isDark ? "text-gray-400" : "text-gray-600"
                } text-sm uppercase font-semibold`}
              >
                {t("Select Player")} *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700]">
                  <Star size={18} fill="currentColor" />
                </div>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className={`w-full rounded-xl py-4 pl-12 pr-10 text-sm outline-none italic appearance-none cursor-pointer ${
                    isDark
                      ? "bg-[#0A1A44]/40 border border-blue-900/50 text-white"
                      : "bg-white border border-gray-300 text-black"
                  }`}
                  required
                >
                  <option value="">{t("Select Player")}</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFD700] pointer-events-none"
                  size={18}
                />
              </div>

              {selectedPlayer && (
                <div
                  className={`p-3 rounded-lg flex items-center justify-between transition mt-4 ${
                    isDark
                      ? "bg-[#051139]/50 border border-blue-900/30"
                      : "bg-white shadow"
                  }`}
                >
                  <div className="flex items-center gap-4">
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
                    <div>
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
                  <div className="flex items-center gap-2">
                    <div className="flex text-[#FFD700]">
                      {[...Array(7)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          fill={
                            i < Math.floor(selectedPlayer.average_rating || 0)
                              ? "currentColor"
                              : "none"
                          }
                          className={
                            i < Math.floor(selectedPlayer.average_rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {selectedPlayer.average_rating?.toFixed(1) || "0"}
                    </span>
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
              }`}
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition ${
                isDark
                  ? "bg-[#0A1A44] border border-[#FFD700]/40 text-white hover:bg-[#FFD700] hover:text-black"
                  : "bg-yellow-400 text-black hover:bg-yellow-500"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="font-bold uppercase">
                {loading ? t("Sending...") : t("Send Request")}
              </span>
              <Send size={20} />
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isDark
                      ? "bg-[#0a0f2c] border border-[#1e2a5a] hover:bg-[#1e2a5a]"
                      : "bg-white border border-gray-200 shadow hover:bg-gray-50"
                  }`}
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
                      className={`absolute top-full right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden z-20 ${
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
                          }`}
                        >
                          <span className="flex items-center gap-2">
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
                            {getStatusCount(status)}
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
            ) : getFilteredRequests().length === 0 ? (
              <div
                className={`text-center py-20 rounded-xl ${
                  isDark ? "bg-[#0a1128]" : "bg-white shadow"
                }`}
              >
                <SendIcon size={48} className="mx-auto mb-4 text-gray-500" />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {statusFilter === "ALL"
                    ? t("No sent requests")
                    : t(
                        `No ${getStatusLabel(
                          statusFilter,
                        ).toLowerCase()} requests found`,
                      )}
                </p>
              </div>
            ) : (
              getFilteredRequests().map((request) => (
                <div
                  key={request.id}
                  className={`p-5 rounded-xl transition ${
                    isDark
                      ? "bg-[#0A1A44]/40 border border-blue-900/30"
                      : "bg-white shadow"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">
                        {request.playerName || t("Player")}
                      </h3>
                      {request.payload && (
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          } mt-2`}
                        >
                          <MessageSquare size={14} className="inline mr-1" />
                          {getPayloadMessage(request.payload)}
                        </p>
                      )}
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        } mt-2 flex items-center gap-1`}
                      >
                        <Clock size={12} />
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {request.status?.toUpperCase() === "PENDING" && (
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
