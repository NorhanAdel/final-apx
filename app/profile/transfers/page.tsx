"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  ChevronDown,
} from "lucide-react";
import { GET_MY_TRANSFERS } from "@/app/graphql/query/transfer.queries";
import { toast } from "sonner";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import BackButton from "@/app/components/BackButton";

interface Transfer {
  id: string;
  player_id: string;
  from_club: string;
  to_club: string;
  club_name: string | null;
  status: string;
  transfer_date: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function TransfersPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ myTransfers: Transfer[] }>(
        GET_MY_TRANSFERS,
      );

      if (result.data?.myTransfers) {
        setTransfers(result.data.myTransfers);
        setFilteredTransfers(result.data.myTransfers);
      } else if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        toast.error(result.errors[0]?.message || t("Failed to load transfers"));
      }
    } catch (error) {
      console.error("Error fetching transfers:", error);
      toast.error(t("Failed to load transfers"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Apply filter when statusFilter changes
  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredTransfers(transfers);
    } else {
      const filtered = transfers.filter((transfer) => {
        const lowerStatus = transfer.status.toLowerCase();
        const filterLower = statusFilter.toLowerCase();
        if (filterLower === "completed") {
          return (
            lowerStatus.includes("completed") || lowerStatus.includes("مكتمل")
          );
        }
        if (filterLower === "pending") {
          return (
            lowerStatus.includes("pending") ||
            lowerStatus.includes("قيد الانتظار")
          );
        }
        if (filterLower === "cancelled") {
          return (
            lowerStatus.includes("cancelled") || lowerStatus.includes("ملغي")
          );
        }
        return false;
      });
      setFilteredTransfers(filtered);
    }
  }, [statusFilter, transfers]);

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

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("completed") || lowerStatus.includes("مكتمل")) {
      return "text-green-500";
    }
    if (
      lowerStatus.includes("pending") ||
      lowerStatus.includes("قيد الانتظار")
    ) {
      return "text-yellow-500";
    }
    if (lowerStatus.includes("cancelled") || lowerStatus.includes("ملغي")) {
      return "text-red-500";
    }
    return "text-gray-400";
  };

  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("completed") || lowerStatus.includes("مكتمل")) {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    if (
      lowerStatus.includes("pending") ||
      lowerStatus.includes("قيد الانتظار")
    ) {
      return <Clock size={16} className="text-yellow-500" />;
    }
    if (lowerStatus.includes("cancelled") || lowerStatus.includes("ملغي")) {
      return <XCircle size={16} className="text-red-500" />;
    }
    return <Clock size={16} className="text-gray-400" />;
  };

  const getStatusLabel = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (
      lowerStatus.includes("pending") ||
      lowerStatus.includes("قيد الانتظار")
    ) {
      return t("Pending");
    }
    if (lowerStatus.includes("completed") || lowerStatus.includes("مكتمل")) {
      return t("Completed");
    }
    if (lowerStatus.includes("cancelled") || lowerStatus.includes("ملغي")) {
      return t("Cancelled");
    }
    return status;
  };

  const getStatusCount = (statusType: string) => {
    if (statusType === "ALL") return transfers.length;
    return transfers.filter((transfer) => {
      const lowerStatus = transfer.status.toLowerCase();
      if (statusType === "PENDING") {
        return (
          lowerStatus.includes("pending") ||
          lowerStatus.includes("قيد الانتظار")
        );
      }
      if (statusType === "COMPLETED") {
        return (
          lowerStatus.includes("completed") || lowerStatus.includes("مكتمل")
        );
      }
      if (statusType === "CANCELLED") {
        return (
          lowerStatus.includes("cancelled") || lowerStatus.includes("ملغي")
        );
      }
      return false;
    }).length;
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
          {t("My Transfers")}
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
                  : statusFilter === "PENDING"
                  ? t("Pending")
                  : statusFilter === "COMPLETED"
                  ? t("Completed")
                  : t("Cancelled")}
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
                  {["ALL", "PENDING", "COMPLETED", "CANCELLED"].map(
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
                                : status === "COMPLETED"
                                ? "bg-green-500"
                                : status === "CANCELLED"
                                ? "bg-red-500"
                                : "bg-gray-400"
                            }`}
                          ></span>
                          {status === "ALL"
                            ? t("All Statuses")
                            : status === "PENDING"
                            ? t("Pending")
                            : status === "COMPLETED"
                            ? t("Completed")
                            : t("Cancelled")}
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

        {filteredTransfers.length === 0 ? (
          <div
            className={`text-center py-10 rounded-md
            ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {statusFilter === "ALL"
              ? t("No transfers found")
              : t(
                  `No ${getStatusLabel(
                    statusFilter === "PENDING"
                      ? "Pending"
                      : statusFilter === "COMPLETED"
                      ? "Completed"
                      : "Cancelled",
                  ).toLowerCase()} transfers found`,
                )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className={`p-4 sm:p-6 rounded-md transition
                ${
                  theme === "dark"
                    ? "border border-[#0d2a5f] bg-[#020d24]"
                    : "border border-gray-200 bg-white shadow"
                }`}
              >
                {/* Transfer Timeline */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* From Club */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm text-gray-400 mb-1">{t("From")}</p>
                    <p className="font-semibold text-lg">
                      {transfer.from_club}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="text-yellow-400">
                    <ArrowRight size={24} className="mx-auto" />
                  </div>

                  {/* To Club */}
                  <div className="flex-1 text-center md:text-right">
                    <p className="text-sm text-gray-400 mb-1">{t("To")}</p>
                    <p className="font-semibold text-lg">{transfer.to_club}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(transfer.status)}
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        transfer.status,
                      )}`}
                    >
                      {transfer.status}
                    </span>
                  </div>
                </div>

                {/* Transfer Date */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} />
                    <span>{t("Transfer Date")}:</span>
                    <span>{formatDate(transfer.transfer_date)}</span>
                  </div>

                  {transfer.completed_at && (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle size={14} />
                      <span>{t("Completed")}:</span>
                      <span>{formatDate(transfer.completed_at)}</span>
                    </div>
                  )}
                </div>

                {/* Notes (if any) */}
                {transfer.notes && (
                  <div className="mt-3 text-sm text-gray-500 italic">
                    &quot;{transfer.notes}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
