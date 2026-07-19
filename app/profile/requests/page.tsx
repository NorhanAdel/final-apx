"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Check, X, Clock, Calendar, Filter, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { GET_INCOMING_REQUESTS } from "@/app/graphql/query/request.queries";
import { RESPOND_TO_REQUEST } from "@/app/graphql/mutation/request.mutations";
import { toast } from "sonner";
import BackButton from "@/app/components/BackButton";

interface Request {
  id: string;
  type: string;
  status: string;
  sender_id: string;
  sender_role: string;
  senderName: string;
  playerName: string;
  payload: {
    message?: string;
  } | null;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url?: string;
  };
  player?: {
    id: string;
    user?: {
      first_name: string;
      last_name: string;
      profile_image_url?: string;
    };
  };
}

const STATUS_TRANSLATIONS: Record<"PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED", string[]> = {
  PENDING: ["pending", "قيد الانتظار", "pendente", "待处理", "待定"],
  ACCEPTED: ["accepted", "مقبول", "aceito", "aceite", "已接受", "已同意"],
  REJECTED: ["rejected", "مرفوض", "rejeitado", "已拒绝"],
  CANCELLED: ["cancelled", "canceled", "ملغي", "ملغى", "cancelado", "已取消"],
};

const matchesStatus = (
  rawStatusFromServer: string,
  target: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED",
): boolean => {
  const normalized = rawStatusFromServer.trim().toLowerCase();
  return STATUS_TRANSLATIONS[target].some((variant) =>
    normalized.includes(variant.toLowerCase()),
  );
};

const getStatusKey = (
  status: string,
): "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | null => {
  if (matchesStatus(status, "PENDING")) return "PENDING";
  if (matchesStatus(status, "ACCEPTED")) return "ACCEPTED";
  if (matchesStatus(status, "REJECTED")) return "REJECTED";
  if (matchesStatus(status, "CANCELLED")) return "CANCELLED";
  return null;
};

export default function RequestsPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ myIncomingRequests: Request[] }>(
        GET_INCOMING_REQUESTS,
      );

      console.log("📋 Incoming requests response:", result);

      if (result.data?.myIncomingRequests) {
        setRequests(result.data.myIncomingRequests);
        setFilteredRequests(result.data.myIncomingRequests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error(t("Failed to load requests"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter((req) =>
        matchesStatus(
          req.status,
          statusFilter as "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED",
        ),
      );
      setFilteredRequests(filtered);
    }
  }, [statusFilter, requests]);

  const handleRespond = async (requestId: string, accept: boolean) => {
    if (processingId) return;

    setProcessingId(requestId);
    try {
      const result = await fetchGraphQL<{
        respondToRequest: { id: string; status: string };
      }>(RESPOND_TO_REQUEST, { input: { request_id: requestId, accept } });

      console.log("📋 Respond response:", result);

      if (result.data?.respondToRequest) {
        const updatedRequest = result.data.respondToRequest;

        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: updatedRequest.status,
                  updated_at: new Date().toISOString(),
                }
              : req,
          ),
        );

        toast.success(accept ? t("Request accepted") : t("Request rejected"));
      } else if (result.errors) {
        toast.error(result.errors[0].message);
      }
    } catch (error) {
      console.error("Error responding to request:", error);
      toast.error(t("Failed to process request"));
    } finally {
      setProcessingId(null);
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return "/b3.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const isPending = (status: string) => matchesStatus(status, "PENDING");

  const getStatusColor = (status: string) => {
    const key = getStatusKey(status);
    if (key === "PENDING") return "text-yellow-500";
    if (key === "ACCEPTED") return "text-green-500";
    if (key === "REJECTED") return "text-red-500";
    return "text-gray-400";
  };

  const getStatusLabel = (status: string) => {
    const key = getStatusKey(status);
    if (key === "PENDING") return t("Pending");
    if (key === "ACCEPTED") return t("Accepted");
    if (key === "REJECTED") return t("Rejected");
    if (key === "CANCELLED") return t("Cancelled");
    return status;
  };

  const getStatusCount = (statusType: string) => {
    if (statusType === "ALL") return requests.length;
    return requests.filter((req) =>
      matchesStatus(
        req.status,
        statusType as "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED",
      ),
    ).length;
  };

  const getTypeDisplay = (type: string) => {
    return type;
  };

  const getNoRequestsMessage = (status: string) => {
    if (status === "PENDING") return t("No pending requests found");
    if (status === "ACCEPTED") return t("No accepted requests found");
    if (status === "REJECTED") return t("No rejected requests found");
    return t("No requests found");
  };

  if (loading && requests.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition
        ${
          theme === "dark"
            ? "bg-[#020617] text-white"
            : "bg-[#f9fafb] text-black"
        }`}
      >
        <div className="text-yellow-400">{t("Loading...")}</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex justify-center py-30 transition
      ${
        theme === "dark" ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"
      }`}
    >
      <div className="w-full max-w-4xl p-4 sm:p-10">
        <BackButton className="mb-6" />

        <h1
          className={`text-center text-3xl font-bold mb-10
          ${theme === "dark" ? "text-yellow-400" : "text-[#F0B100]"}`}
        >
          {t("Requests")}
        </h1>

        <div className="flex justify-end mb-6">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                theme === "dark"
                  ? "bg-[#0a0f2c] border border-[#1e2a5a] hover:bg-[#1e2a5a]"
                  : "bg-white border border-gray-200 shadow hover:bg-gray-50"
              }`}
            >
              <Filter size={16} className="text-yellow-500" />
              <span className="text-sm font-medium">
                {statusFilter === "ALL"
                  ? t("All Statuses")
                  : statusFilter === "PENDING"
                  ? t("Pending")
                  : statusFilter === "ACCEPTED"
                  ? t("Accepted")
                  : t("Rejected")}
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
                    theme === "dark"
                      ? "bg-[#0a0f2c] border border-[#1e2a5a]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition flex items-center justify-between ${
                        statusFilter === status
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
                            status === "PENDING"
                              ? "bg-yellow-500"
                              : status === "ACCEPTED"
                              ? "bg-green-500"
                              : status === "REJECTED"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                        ></span>
                        {status === "ALL"
                          ? t("All Statuses")
                          : status === "PENDING"
                          ? t("Pending")
                          : status === "ACCEPTED"
                          ? t("Accepted")
                          : t("Rejected")}
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

        {filteredRequests.length === 0 ? (
          <div
            className={`text-center py-10 rounded-md
            ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {getNoRequestsMessage(statusFilter)}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredRequests.map((req) => {
              const profileImage = req.sender?.profile_image_url || 
                                   req.player?.user?.profile_image_url;
              const displayName = req.senderName || 
                                  req.sender?.first_name || 
                                  req.sender?.last_name || 
                                  req.sender_id;
              const typeDisplay = getTypeDisplay(req.type);

              return (
                <div
                  key={req.id}
                  className={`p-4 sm:p-6 rounded-md flex flex-col items-center text-center gap-4 transition
                  ${
                    theme === "dark"
                      ? "border border-[#0d2a5f] bg-[#020d24]"
                      : "border border-gray-200 bg-white shadow"
                  }`}
                >
                  <div className="w-20 h-20 relative rounded-full overflow-hidden">
                    <Image
                      src={getFullImageUrl(profileImage)}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{displayName}</h3>
                    <span className="text-yellow-400 text-sm">
                      {req.sender_role || typeDisplay}
                    </span>
                  </div>

                  <div className={`text-sm ${getStatusColor(req.status)}`}>
                    <Clock size={14} className="inline mr-1" />
                    {getStatusLabel(req.status)}
                  </div>

                  {req.payload?.message && (
                    <p
                      className={`leading-relaxed
                      ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {req.payload.message}
                    </p>
                  )}

                  <span
                    className={`text-sm flex items-center gap-1
                    ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                  >
                    <Calendar size={14} />
                    {formatDate(req.created_at)}
                  </span>

                  {isPending(req.status) ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
                      <button
                        onClick={() => handleRespond(req.id, true)}
                        disabled={processingId === req.id}
                        className={`w-full sm:w-auto px-6 py-2 border-2 rounded-md transition flex items-center justify-center gap-2
                        ${
                          theme === "dark"
                            ? "bg-[#021448] border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            : "bg-white border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processingId === req.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Check size={16} /> {t("Accept")}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRespond(req.id, false)}
                        disabled={processingId === req.id}
                        className={`w-full sm:w-auto px-6 py-2 border-2 rounded-md transition flex items-center justify-center gap-2
                        ${
                          theme === "dark"
                            ? "bg-[#021448] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            : "bg-white border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processingId === req.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <X size={16} /> {t("Reject")}
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`text-sm font-medium ${getStatusColor(
                        req.status,
                      )}`}
                    >
                      {getStatusLabel(req.status)} - {formatDate(req.updated_at)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}