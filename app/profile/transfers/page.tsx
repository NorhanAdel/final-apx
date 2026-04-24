"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { GET_MY_TRANSFERS } from "@/app/graphql/query/transfer.queries";
import { toast } from "sonner";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";

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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ myTransfers: Transfer[] }>(
        GET_MY_TRANSFERS,
      );

      if (result.data?.myTransfers) {
        setTransfers(result.data.myTransfers);
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

  // Get status color based on status (works for both English and Arabic)
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

  // Get status icon
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

  // Filter transfers by status
  const getFilteredTransfers = () => {
    if (filter === "ALL") return transfers;
    const lowerFilter = filter.toLowerCase();
    return transfers.filter((transfer) => {
      const lowerStatus = transfer.status.toLowerCase();
      if (lowerFilter === "completed") {
        return (
          lowerStatus.includes("completed") || lowerStatus.includes("مكتمل")
        );
      }
      if (lowerFilter === "pending") {
        return (
          lowerStatus.includes("pending") ||
          lowerStatus.includes("قيد الانتظار")
        );
      }
      if (lowerFilter === "cancelled") {
        return (
          lowerStatus.includes("cancelled") || lowerStatus.includes("ملغي")
        );
      }
      return true;
    });
  };

  const filterOptions = [
    { value: "ALL", label: t("All") },
    { value: "COMPLETED", label: t("Completed") },
    { value: "PENDING", label: t("Pending") },
    { value: "CANCELLED", label: t("Cancelled") },
  ];

  const filteredTransfers = getFilteredTransfers();

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
          className={`text-center text-3xl font-bold mb-6
          ${theme === "dark" ? "text-yellow-400" : "text-[#F0B100]"}`}
        >
          {t("My Transfers")}
        </h1>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition
                ${
                  filter === option.value
                    ? "bg-yellow-500 text-white"
                    : theme === "dark"
                    ? "bg-[#021448] text-gray-300 hover:bg-yellow-500/20"
                    : "bg-gray-100 text-gray-700 hover:bg-yellow-500/20"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filteredTransfers.length === 0 ? (
          <div
            className={`text-center py-10 rounded-md
            ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("No transfers found")}
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
