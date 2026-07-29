// src/app/transfers/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Filter,
  ChevronDown,
  Building2,
} from "lucide-react";
import Image from "next/image";
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
  logo_url?: string | null;
  club_logo_url?: string | null;
  status: string;
  transfer_date: string;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_TRANSLATIONS: Record<string, Record<string, string>> = {
  PENDING: {
    en: "Pending",
    ar: "قيد الانتظار",
    pt: "Pendente",
    zh: "待处理",
  },
  COMPLETED: {
    en: "Completed",
    ar: "مكتمل",
    pt: "Concluído",
    zh: "已完成",
  },
  CANCELLED: {
    en: "Cancelled",
    ar: "ملغي",
    pt: "Cancelado",
    zh: "已取消",
  },
};

function getFullImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://albatal.info";
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

const getStatusKey = (status: string): string => {
  const lower = status.toLowerCase().trim();

  for (const [key, translations] of Object.entries(STATUS_TRANSLATIONS)) {
    for (const [, value] of Object.entries(translations)) {
      if (lower.includes(value.toLowerCase())) {
        return key;
      }
    }
  }

  const statusMap: Record<string, string> = {
    pending: "PENDING",
    "قيد الانتظار": "PENDING",
    pendente: "PENDING",
    待处理: "PENDING",
    completed: "COMPLETED",
    مكتمل: "COMPLETED",
    concluído: "COMPLETED",
    已完成: "COMPLETED",
    cancelled: "CANCELLED",
    ملغي: "CANCELLED",
    cancelado: "CANCELLED",
    已取消: "CANCELLED",
  };

  return statusMap[lower] || status.toUpperCase();
};

const matchesStatus = (status: string, targetKey: string): boolean => {
  const normalized = getStatusKey(status);
  return normalized === targetKey;
};

export default function TransfersPage() {
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isRTL = lang === "ar";

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

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredTransfers(transfers);
    } else {
      const filtered = transfers.filter((transfer) => {
        return matchesStatus(transfer.status, statusFilter);
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
    const key = getStatusKey(status);
    switch (key) {
      case "PENDING":
        return "text-yellow-500";
      case "COMPLETED":
        return "text-green-500";
      case "CANCELLED":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    const key = getStatusKey(status);
    switch (key) {
      case "COMPLETED":
        return <CheckCircle size={16} className="text-green-500" />;
      case "PENDING":
        return <Clock size={16} className="text-yellow-500" />;
      case "CANCELLED":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const key = getStatusKey(status);
    const translations =
      STATUS_TRANSLATIONS[key as keyof typeof STATUS_TRANSLATIONS];
    if (translations && translations[lang]) {
      return translations[lang];
    }
    return status;
  };

  const getStatusCount = (statusType: string) => {
    if (statusType === "ALL") return transfers.length;
    return transfers.filter((transfer) => {
      return matchesStatus(transfer.status, statusType);
    }).length;
  };

  const getNoTransfersMessage = (status: string) => {
    if (status === "ALL") return t("No transfers found");
    if (status === "PENDING") return t("No pending transfers found");
    if (status === "COMPLETED") return t("No completed transfers found");
    if (status === "CANCELLED") return t("No cancelled transfers found");
    return t("No transfers found");
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
                  : getStatusLabel(statusFilter)}
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
                            : getStatusLabel(status)}
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
            {getNoTransfersMessage(statusFilter)}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredTransfers.map((transfer) => {
              const clubLogo = getFullImageUrl(transfer.logo_url || transfer.club_logo_url);
              const clubNameText = transfer.club_name || transfer.to_club;

              return (
                <div
                  key={transfer.id}
                  className={`p-4 sm:p-6 rounded-md transition
                  ${
                    theme === "dark"
                      ? "border border-[#0d2a5f] bg-[#020d24]"
                      : "border border-gray-200 bg-white shadow"
                  }`}
                >
                  {/* Club Logo & Name Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-yellow-500/30 bg-white/5 flex items-center justify-center">
                      {clubLogo ? (
                        <Image
                          src={clubLogo}
                          alt={clubNameText}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Building2 size={14} className="text-yellow-500" />
                      )}
                    </div>
                    <span className="font-bold text-base">{clubNameText}</span>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                        <div>
                          <p className="text-sm text-gray-400">{t("From")}</p>
                          <p className="font-semibold text-lg">
                            {transfer.from_club}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-yellow-400">
                      {isRTL ? (
                        <ArrowLeft size={24} className="mx-auto" />
                      ) : (
                        <ArrowRight size={24} className="mx-auto" />
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-right">
                      <div className="flex items-center justify-center md:justify-end gap-3 mb-1">
                        <div>
                          <p className="text-sm text-gray-400">{t("To")}</p>
                          <p className="font-semibold text-lg">
                            {transfer.to_club}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(transfer.status)}
                      <span
                        className={`text-sm font-medium ${getStatusColor(
                          transfer.status,
                        )}`}
                      >
                        {getStatusLabel(transfer.status)}
                      </span>
                    </div>
                  </div>

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

                  {transfer.notes && (
                    <div className="mt-3 text-sm text-gray-500 italic">
                      &quot;{transfer.notes}&quot;
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
