"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Check, X, Clock, Calendar } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { GET_INCOMING_REQUESTS } from "@/app/graphql/query/request.queries";
import { RESPOND_TO_REQUEST } from "@/app/graphql/mutation/request.mutations";
import { toast } from "sonner";

interface Request {
  id: string;
  type: string; // Already translated from backend
  status: string; // Already translated from backend
  sender_id: string;
  sender_role: string;
  senderName: string; // Already translated from profile
  playerName: string; // Already translated from profile
  payload: {
    message?: string; // Will be translated by backend
  } | null;
  created_at: string;
  updated_at: string;
  player?: {
    id: string;
    user?: {
      first_name: string;
      last_name: string;
      profile_image_url?: string;
    };
  };
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_image_url?: string;
  };
}

export default function RequestsPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ myIncomingRequests: Request[] }>(
        GET_INCOMING_REQUESTS,
      );

      if (result.data?.myIncomingRequests) {
        setRequests(result.data.myIncomingRequests);
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

  const handleRespond = async (requestId: string, accept: boolean) => {
    setProcessingId(requestId);
    try {
      const result = await fetchGraphQL<{
        respondToRequest: { id: string; status: string };
      }>(RESPOND_TO_REQUEST, { input: { request_id: requestId, accept } });

      if (result.data?.respondToRequest) {
        toast.success(accept ? t("Request accepted") : t("Request rejected"));
        await fetchRequests();
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

  // Check if request is pending (works for both English and Arabic)
  const isPending = (status: string) => {
    const lowerStatus = status.toLowerCase();
    return (
      lowerStatus.includes("pending") || lowerStatus.includes("قيد الانتظار")
    );
  };

  // Get status color based on status text (works for both English and Arabic)
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (
      lowerStatus.includes("pending") ||
      lowerStatus.includes("قيد الانتظار")
    ) {
      return "text-yellow-500";
    }
    if (lowerStatus.includes("accepted") || lowerStatus.includes("مقبول")) {
      return "text-green-500";
    }
    if (lowerStatus.includes("rejected") || lowerStatus.includes("مرفوض")) {
      return "text-red-500";
    }
    return "text-gray-400";
  };

  // Get type display (already translated from backend)
  const getTypeDisplay = (type: string) => {
    return type;
  };

  if (loading) {
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
        <h1
          className={`text-center text-3xl font-bold mb-10
          ${theme === "dark" ? "text-yellow-400" : "text-[#F0B100]"}`}
        >
          {t("Requests")}
        </h1>

        {requests.length === 0 ? (
          <div
            className={`text-center py-10 rounded-md
            ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("No requests found")}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {requests.map((req) => {
              const profileImage = req.sender?.profile_image_url;
              const displayName =
                req.senderName || req.sender?.first_name || req.sender_id;
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
                    {req.status}
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

                  {/* Show accept/reject buttons only for pending requests */}
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
                      {req.status} - {formatDate(req.updated_at)}
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
