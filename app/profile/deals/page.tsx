"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Check,
  X,
  Clock,
  Calendar,
  DollarSign,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { GET_MY_DEALS } from "@/app/graphql/query/deal.queries";
import {
  ACCEPT_DEAL,
  REJECT_DEAL,
} from "@/app/graphql/mutation/deal.mutations";
import { toast } from "sonner";
import BackButton from "@/app/components/BackButton";

interface Deal {
  id: string;
  player_id: string;
  sender_id: string;
  offer_type: string;
  description: string | null;
  club_name: string | null;
  value: number | null;
  commission_rate: number;
  status: string;
  admin_approved: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  playerName: string;
  senderName: string;
}

export default function DealsPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ myDeals: Deal[] }>(GET_MY_DEALS, {});

      if (result.data?.myDeals) {
        setDeals(result.data.myDeals);
        setFilteredDeals(result.data.myDeals);
      } else if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        toast.error(result.errors[0]?.message || t("Failed to load deals"));
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error(t("Failed to load deals"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Apply filter when statusFilter changes
  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredDeals(deals);
    } else {
      const filtered = deals.filter((deal) => {
        const lowerStatus = deal.status.toLowerCase();
        const filterLower = statusFilter.toLowerCase();
        return lowerStatus.includes(filterLower);
      });
      setFilteredDeals(filtered);
    }
  }, [statusFilter, deals]);

  const handleAccept = async (dealId: string) => {
    setProcessingId(dealId);
    try {
      const result = await fetchGraphQL<{
        acceptDeal: { id: string; status: string };
      }>(ACCEPT_DEAL, { id: dealId });

      if (result.data?.acceptDeal) {
        toast.success(t("Deal accepted successfully"));
        await fetchDeals();
      } else if (result.errors) {
        toast.error(result.errors[0]?.message || t("Failed to accept deal"));
      }
    } catch (error) {
      console.error("Error accepting deal:", error);
      toast.error(t("Failed to accept deal"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (dealId: string) => {
    setProcessingId(dealId);
    try {
      const result = await fetchGraphQL<{
        rejectDeal: { id: string; status: string };
      }>(REJECT_DEAL, { id: dealId });

      if (result.data?.rejectDeal) {
        toast.success(t("Deal rejected successfully"));
        await fetchDeals();
      } else if (result.errors) {
        toast.error(result.errors[0]?.message || t("Failed to reject deal"));
      }
    } catch (error) {
      console.error("Error rejecting deal:", error);
      toast.error(t("Failed to reject deal"));
    } finally {
      setProcessingId(null);
    }
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

  const formatCurrency = (value: number | null) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isPending = (status: string) => {
    const lowerStatus = status.toLowerCase();
    return (
      lowerStatus.includes("pending") || lowerStatus.includes("قيد الانتظار")
    );
  };

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
    if (lowerStatus.includes("expired") || lowerStatus.includes("منتهي")) {
      return "text-gray-500";
    }
    return "text-gray-400";
  };

  const getStatusLabel = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (
      lowerStatus.includes("pending") ||
      lowerStatus.includes("قيد الانتظار")
    ) {
      return t("Pending");
    }
    if (lowerStatus.includes("accepted") || lowerStatus.includes("مقبول")) {
      return t("Accepted");
    }
    if (lowerStatus.includes("rejected") || lowerStatus.includes("مرفوض")) {
      return t("Rejected");
    }
    if (lowerStatus.includes("expired") || lowerStatus.includes("منتهي")) {
      return t("Expired");
    }
    return status;
  };

  const getStatusCount = (statusType: string) => {
    if (statusType === "ALL") return deals.length;
    return deals.filter((deal) => {
      const lowerStatus = deal.status.toLowerCase();
      if (statusType === "PENDING") {
        return (
          lowerStatus.includes("pending") ||
          lowerStatus.includes("قيد الانتظار")
        );
      }
      if (statusType === "ACCEPTED") {
        return (
          lowerStatus.includes("accepted") || lowerStatus.includes("مقبول")
        );
      }
      if (statusType === "REJECTED") {
        return (
          lowerStatus.includes("rejected") || lowerStatus.includes("مرفوض")
        );
      }
      if (statusType === "EXPIRED") {
        return lowerStatus.includes("expired") || lowerStatus.includes("منتهي");
      }
      return false;
    }).length;
  };

  const getOfferTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("transfer")) return "🔄";
    if (lowerType.includes("loan")) return "📋";
    if (lowerType.includes("trial")) return "⚽";
    return "📄";
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
        <BackButton className="mb-6" />
        
        <h1
          className={`text-center text-3xl font-bold mb-6
          ${theme === "dark" ? "text-yellow-400" : "text-[#F0B100]"}`}
        >
          {t("Deals")}
        </h1>

        {/* Status Filter Dropdown */}
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
                  : getStatusLabel(
                      statusFilter === "PENDING"
                        ? "Pending"
                        : statusFilter === "ACCEPTED"
                        ? "Accepted"
                        : statusFilter === "REJECTED"
                        ? "Rejected"
                        : "Expired",
                    )}
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
                  {["ALL", "PENDING", "ACCEPTED", "REJECTED", "EXPIRED"].map(
                    (status) => (
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
                                : status === "EXPIRED"
                                ? "bg-gray-500"
                                : "bg-gray-400"
                            }`}
                          ></span>
                          {status === "ALL"
                            ? t("All Statuses")
                            : status === "PENDING"
                            ? t("Pending")
                            : status === "ACCEPTED"
                            ? t("Accepted")
                            : status === "REJECTED"
                            ? t("Rejected")
                            : t("Expired")}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20">
                          {getStatusCount(status)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <div
            className={`text-center py-10 rounded-md
            ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {statusFilter === "ALL"
              ? t("No deals found")
              : t(
                  `No ${getStatusLabel(
                    statusFilter === "PENDING"
                      ? "Pending"
                      : statusFilter === "ACCEPTED"
                      ? "Accepted"
                      : statusFilter === "REJECTED"
                      ? "Rejected"
                      : "Expired",
                  ).toLowerCase()} deals found`,
                )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredDeals.map((deal) => {
              const displayName = deal.senderName;
              const clubName = deal.club_name;
              const offerTypeIcon = getOfferTypeIcon(deal.offer_type);

              return (
                <div
                  key={deal.id}
                  className={`p-4 sm:p-6 rounded-md flex flex-col gap-4 transition
                  ${
                    theme === "dark"
                      ? "border border-[#0d2a5f] bg-[#020d24]"
                      : "border border-gray-200 bg-white shadow"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{displayName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-400 text-sm flex items-center gap-1">
                          <span>{offerTypeIcon}</span>
                          <span>{deal.offer_type}</span>
                        </span>
                        {clubName && (
                          <span className="text-sm flex items-center gap-1 text-gray-400">
                            <span>🏢</span>
                            <span>{clubName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${getStatusColor(
                        deal.status,
                      )}`}
                    >
                      <Clock size={14} className="inline mr-1" />
                      {deal.status}
                    </div>
                  </div>

                  {/* Description */}
                  {deal.description && (
                    <p
                      className={`leading-relaxed text-sm
                      ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {deal.description}
                    </p>
                  )}

                  {/* Value and Commission */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {deal.value && (
                      <div className="flex items-center gap-1 text-green-500">
                        <DollarSign size={14} />
                        <span>{formatCurrency(deal.value)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>💰</span>
                      <span>
                        {t("Commission")}: {deal.commission_rate}%
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <span
                    className={`text-sm flex items-center gap-1
                    ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                  >
                    <Calendar size={14} />
                    {formatDate(deal.created_at)}
                    {deal.expires_at && (
                      <span className="ml-2 text-red-400">
                        {t("Expires")}: {formatDate(deal.expires_at)}
                      </span>
                    )}
                  </span>

                  {/* Show accept/reject buttons only for pending deals */}
                  {isPending(deal.status) ? (
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
                      <button
                        onClick={() => handleAccept(deal.id)}
                        disabled={processingId === deal.id}
                        className={`w-full sm:w-auto px-6 py-2 border-2 rounded-md transition flex items-center justify-center gap-2
                        ${
                          theme === "dark"
                            ? "bg-[#021448] border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            : "bg-white border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processingId === deal.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Check size={16} /> {t("Accept")}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleReject(deal.id)}
                        disabled={processingId === deal.id}
                        className={`w-full sm:w-auto px-6 py-2 border-2 rounded-md transition flex items-center justify-center gap-2
                        ${
                          theme === "dark"
                            ? "bg-[#021448] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            : "bg-white border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processingId === deal.id ? (
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
                        deal.status,
                      )} mt-2`}
                    >
                      {deal.status} - {formatDate(deal.updated_at)}
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
