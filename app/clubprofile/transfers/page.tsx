"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Building2,
  Send,
  Loader2,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  ArrowRight,
  User,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { GET_ALL_TRANSFERS } from "../../graphql/query/transfer.queries";
import { GET_DEALS_BY_STATUS } from "@/app/graphql/query/deal.queries";
import { CREATE_TRANSFER_FROM_DEAL } from "../../graphql/mutation/transfer.mutations";

interface Transfer {
  id: string;
  player_id: string;
  from_club: string;
  to_club: string;
  club_name: string | null;
  status: string;
  transfer_date: string;
  completed_at: string | null;
  created_at: string;
  playerName: string;
  fromClubName: string;
  toClubName: string;
  notes: string | null;
}

interface Deal {
  id: string;
  player_id: string;
  playerName: string;
  offer_type: string;
  club_name: string | null;
  value: number | null;
  status: string;
  created_at: string;
}

export default function ClubTransfersPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"create" | "my">("create");

  // Create Transfer State
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [creating, setCreating] = useState(false);

  // My Transfers State
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch Accepted Deals for Create Tab
  const fetchAcceptedDeals = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ dealsByStatus: Deal[] }>(
        GET_DEALS_BY_STATUS,
        { status: "ACCEPTED", limit: 100 },
      );
      if (result.data?.dealsByStatus) {
        setDeals(result.data.dealsByStatus);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error(t("Failed to load accepted deals"));
    }
  }, [t]);

  // Fetch My Transfers
  // Fetch My Transfers
  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ allTransfers: Transfer[] }>(
        GET_ALL_TRANSFERS,
        {},
      );
      if (result.data?.allTransfers) {
        setTransfers(result.data.allTransfers);
        setFilteredTransfers(result.data.allTransfers);
      } else {
        console.log("No allTransfers in data:", result.data);
      }
    } catch (error) {
      console.error("Error fetching transfers:", error);
      toast.error(t("Failed to load transfers"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (activeTab === "create") {
      fetchAcceptedDeals();
    } else {
      fetchTransfers();
    }
  }, [activeTab, fetchAcceptedDeals, fetchTransfers]);

  useEffect(() => {
    if (statusFilter === "ALL") {
      setFilteredTransfers(transfers);
    } else {
      setFilteredTransfers(
        transfers.filter(
          (transfer) => transfer.status.toUpperCase() === statusFilter,
        ),
      );
    }
  }, [statusFilter, transfers]);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId) {
      toast.error(t("Please select a deal"));
      return;
    }

    setCreating(true);
    try {
      const result = await fetchGraphQL<{ createTransferFromDeal: Transfer }>(
        CREATE_TRANSFER_FROM_DEAL,
        { dealId: selectedDealId },
      );

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data?.createTransferFromDeal) {
        toast.success(t("Transfer created successfully!"));
        setSelectedDealId("");
        setActiveTab("my");
        fetchTransfers();
      }
    } catch (error) {
      console.error("Error creating transfer:", error);
      toast.error(t("Failed to create transfer"));
    } finally {
      setCreating(false);
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

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("completed")) {
      return "text-green-500 bg-green-500/10";
    }
    if (lowerStatus.includes("pending")) {
      return "text-yellow-500 bg-yellow-500/10";
    }
    if (lowerStatus.includes("cancelled")) {
      return "text-red-500 bg-red-500/10";
    }
    return "text-gray-400 bg-gray-500/10";
  };

  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("completed"))
      return <CheckCircle size={14} className="text-green-500" />;
    if (lowerStatus.includes("pending"))
      return <Clock size={14} className="text-yellow-500" />;
    if (lowerStatus.includes("cancelled"))
      return <XCircle size={14} className="text-red-500" />;
    return null;
  };

  const getStatusCount = (status: string) => {
    if (status === "ALL") return transfers.length;
    return transfers.filter(
      (transfer) => transfer.status.toUpperCase() === status,
    ).length;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ALL":
        return t("All Statuses");
      case "COMPLETED":
        return t("Completed");
      case "PENDING":
        return t("Pending");
      case "CANCELLED":
        return t("Cancelled");
      default:
        return t("All Statuses");
    }
  };

  const selectedDeal = deals.find((d) => d.id === selectedDealId);

  return (
    <div
      className={`min-h-screen py-20 px-6 transition ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black italic tracking-tighter text-yellow-400 uppercase text-center mb-10">
          {t("Transfers")}
        </h1>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab("create");
              setSelectedDealId("");
            }}
            className={`px-6 py-2 rounded-md font-semibold transition flex items-center gap-2 ${
              activeTab === "create"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-[#F0B100] text-black"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            <Plus size={18} />
            {t("Create Transfer")}
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 rounded-md font-semibold transition flex items-center gap-2 ${
              activeTab === "my"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-[#F0B100] text-black"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            <Building2 size={18} />
            {t("My Transfers")}
          </button>
        </div>

        {activeTab === "create" ? (
          // Create Transfer Tab
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
              {t("Create Transfer from Accepted Deal")}
            </h2>

            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Select Accepted Deal")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                  className={`w-full rounded-lg px-4 py-2 outline-none border ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                      : "bg-white border-gray-300 text-black focus:border-yellow-400"
                  }`}
                  required
                >
                  <option value="">{t("Select a deal")}</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.playerName} - {deal.offer_type} -{" "}
                      {deal.club_name || t("No club")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDeal && (
                <div
                  className={`p-4 rounded-lg ${
                    isDark
                      ? "bg-[#051139]/50 border border-blue-900/30"
                      : "bg-gray-50 border"
                  }`}
                >
                  <h3 className="font-semibold mb-2">{t("Deal Details")}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-yellow-500" />
                      <span>{selectedDeal.playerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-yellow-500" />
                      <span>
                        {selectedDeal.club_name || t("No club specified")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight size={16} className="text-green-500" />
                      <span>{selectedDeal.offer_type}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDealId("");
                  }}
                  className={`flex-1 py-2 rounded-md transition ${
                    isDark
                      ? "bg-[#1e2a5a] text-white hover:bg-[#2a3a7a]"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  {t("Clear")}
                </button>
                <button
                  type="submit"
                  disabled={creating || !selectedDealId}
                  className={`flex-1 py-2 rounded-md transition flex items-center justify-center gap-2 ${
                    isDark
                      ? "bg-yellow-400 text-black hover:bg-yellow-500"
                      : "bg-[#F0B100] text-black hover:bg-yellow-500"
                  } ${
                    creating || !selectedDealId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {creating ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {t("Create Transfer")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          // My Transfers Tab
          <div className="space-y-4">
            {/* Status Filter Dropdown */}
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
                      {["ALL", "COMPLETED", "PENDING", "CANCELLED"].map(
                        (status) => (
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
                                  status === "COMPLETED"
                                    ? "bg-green-500"
                                    : status === "PENDING"
                                    ? "bg-yellow-500"
                                    : status === "CANCELLED"
                                    ? "bg-red-500"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                              {getStatusLabel(status)}
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

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-yellow-500" />
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div
                className={`text-center py-20 rounded-xl ${
                  isDark ? "bg-[#0a1128]" : "bg-white shadow"
                }`}
              >
                <Send size={48} className="mx-auto mb-4 text-gray-500" />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {statusFilter === "ALL"
                    ? t("No transfers found")
                    : t(
                        `No ${getStatusLabel(
                          statusFilter,
                        ).toLowerCase()} transfers found`,
                      )}
                </p>
                {statusFilter !== "ALL" && (
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className={`mt-4 px-4 py-2 rounded-md transition ${
                      isDark
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : "bg-[#F0B100] text-black hover:bg-yellow-500"
                    }`}
                  >
                    {t("View all transfers")}
                  </button>
                )}
              </div>
            ) : (
              filteredTransfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className={`p-4 rounded-xl transition ${
                    isDark
                      ? "bg-[#0a1128] border border-[#0f2b63]"
                      : "bg-white border border-gray-200 shadow"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">
                          {transfer.playerName}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            transfer.status,
                          )}`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(transfer.status)}
                            {transfer.status}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-blue-500">
                          <Building2 size={14} /> {transfer.from_club}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="flex items-center gap-1 text-green-500">
                          <Building2 size={14} /> {transfer.to_club}
                        </span>
                        {transfer.club_name && (
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Building2 size={14} /> {transfer.club_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />{" "}
                          {formatDate(transfer.created_at)}
                        </span>
                      </div>
                      {transfer.notes && (
                        <p
                          className={`text-sm mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {transfer.notes.length > 150
                            ? `${transfer.notes.substring(0, 150)}...`
                            : transfer.notes}
                        </p>
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
