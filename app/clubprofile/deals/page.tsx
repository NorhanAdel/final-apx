"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  AlertTriangle,
  Building2,
  User,
  Send,
  Loader2,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import {
  GET_DEALS_BY_STATUS,
  GET_PLAYERS_FOR_DEALS,
} from "@/app/graphql/query/deal.queries";
import {
  CREATE_DEAL,
  UPDATE_DEAL,
  DELETE_DEAL,
} from "@/app/graphql/mutation/deal.mutations";
import { toast } from "sonner";

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

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  average_rating: number;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  dealTitle,
  isDark,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dealTitle: string;
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
            {t("Delete Deal")}
          </h3>
        </div>
        <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {t("Are you sure you want to delete")}{" "}
          <span className="font-semibold text-yellow-500">{dealTitle}</span>?
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

export default function ClubDealsPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<"send" | "sent">("send");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formData, setFormData] = useState({
    player_id: "",
    offer_type: "TRANSFER",
    description: "",
    club_name: "",
    value: "",
    commission_rate: "15",
    expires_at: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchGraphQL<{ dealsByStatus: Deal[] }>(
        GET_DEALS_BY_STATUS,
        { status: "PENDING", limit: 50 },
      );
      if (result.data?.dealsByStatus) {
        setDeals(result.data.dealsByStatus);
        setFilteredDeals(result.data.dealsByStatus);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error(t("Failed to load deals"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchPlayers = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ getAllPlayers: { data: Player[] } }>(
        GET_PLAYERS_FOR_DEALS,
        { skip: 0, take: 50 },
      );
      if (result.data?.getAllPlayers?.data)
        setPlayers(result.data.getAllPlayers.data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    fetchPlayers();
  }, [fetchDeals, fetchPlayers]);

  useEffect(() => {
    if (statusFilter === "ALL") setFilteredDeals(deals);
    else
      setFilteredDeals(
        deals.filter((deal) => deal.status.toUpperCase() === statusFilter),
      );
  }, [statusFilter, deals]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.player_id) newErrors.player_id = t("Please select a player");
    if (!formData.offer_type)
      newErrors.offer_type = t("Please select an offer type");
    if (formData.commission_rate) {
      const rate = parseInt(formData.commission_rate);
      if (rate < 10 || rate > 30)
        newErrors.commission_rate = t(
          "Commission rate must be between 10% and 30%",
        );
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setEditingDeal(null);
    setFormData({
      player_id: "",
      offer_type: "TRANSFER",
      description: "",
      club_name: "",
      value: "",
      commission_rate: "15",
      expires_at: "",
    });
    setErrors({});
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(t("Please fix the errors in the form"));
      return;
    }
    setProcessing(true);
    try {
      const result = await fetchGraphQL<{ createDeal: Deal }>(CREATE_DEAL, {
        input: {
          player_id: formData.player_id,
          offer_type: formData.offer_type,
          description: formData.description || undefined,
          club_name: formData.club_name || undefined,
          value: formData.value ? parseFloat(formData.value) : undefined,
          commission_rate: parseInt(formData.commission_rate),
          expires_at: formData.expires_at
            ? new Date(formData.expires_at).toISOString()
            : undefined,
        },
      });
      if (result.errors) toast.error(result.errors[0].message);
      else if (result.data?.createDeal) {
        toast.success(t("Deal created successfully!"));
        resetForm();
        fetchDeals();
        setActiveTab("sent");
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.error(t("Failed to create deal"));
    } finally {
      setProcessing(false);
    }
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      player_id: deal.player_id,
      offer_type: deal.offer_type,
      description: deal.description || "",
      club_name: deal.club_name || "",
      value: deal.value?.toString() || "",
      commission_rate: deal.commission_rate.toString(),
      expires_at: deal.expires_at?.split("T")[0] || "",
    });
    setActiveTab("send");
  };

  const handleUpdateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editingDeal) {
      toast.error(t("Please fix the errors in the form"));
      return;
    }
    setProcessing(true);
    try {
      const result = await fetchGraphQL<{ updateDeal: Deal }>(UPDATE_DEAL, {
        id: editingDeal.id,
        input: {
          description: formData.description || undefined,
          club_name: formData.club_name || undefined,
          value: formData.value ? parseFloat(formData.value) : undefined,
          commission_rate: parseInt(formData.commission_rate),
          expires_at: formData.expires_at
            ? new Date(formData.expires_at).toISOString()
            : undefined,
        },
      });
      if (result.errors) toast.error(result.errors[0].message);
      else if (result.data?.updateDeal) {
        toast.success(t("Deal updated successfully!"));
        resetForm();
        fetchDeals();
        setActiveTab("sent");
      }
    } catch (error) {
      console.error("Error updating deal:", error);
      toast.error(t("Failed to update deal"));
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteClick = (deal: Deal) => {
    setDealToDelete(deal);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!dealToDelete) return;
    setProcessing(true);
    try {
      const result = await fetchGraphQL<{ deleteDeal: boolean }>(DELETE_DEAL, {
        id: dealToDelete.id,
      });
      if (result.data?.deleteDeal) {
        toast.success(t("Deal deleted successfully"));
        fetchDeals();
      } else if (result.errors) toast.error(result.errors[0].message);
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error(t("Failed to delete deal"));
    } finally {
      setProcessing(false);
      setDeleteModalOpen(false);
      setDealToDelete(null);
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
    if (lowerStatus.includes("pending") || lowerStatus.includes("قيد الانتظار"))
      return "text-yellow-500";
    if (lowerStatus.includes("accepted") || lowerStatus.includes("مقبول"))
      return "text-green-500";
    if (lowerStatus.includes("rejected") || lowerStatus.includes("مرفوض"))
      return "text-red-500";
    if (lowerStatus.includes("expired") || lowerStatus.includes("منتهي"))
      return "text-gray-500";
    return "text-gray-400";
  };
  const getOfferTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("transfer")) return "🔄";
    if (lowerType.includes("loan")) return "📋";
    if (lowerType.includes("trial")) return "⚽";
    return "📄";
  };
  const selectedPlayer = players.find((p) => p.id === formData.player_id);
  const getStatusCount = (status: string) => {
    if (status === "ALL") return deals.length;
    return deals.filter((deal) => deal.status.toUpperCase() === status).length;
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
      case "EXPIRED":
        return t("Expired");
      default:
        return t("All Statuses");
    }
  };

  return (
    <div
      className={`min-h-screen py-20 px-6 transition ${
        isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black italic tracking-tighter text-yellow-400 uppercase text-center mb-10">
          {t("Deals")}
        </h1>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab("send");
              resetForm();
            }}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              activeTab === "send"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-[#F0B100] text-black"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            {t("Send Deal")}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              activeTab === "sent"
                ? isDark
                  ? "bg-yellow-400 text-black"
                  : "bg-[#F0B100] text-black"
                : isDark
                ? "bg-[#0A1A44] text-gray-400 hover:text-white"
                : "bg-gray-200 text-gray-600 hover:text-black"
            }`}
          >
            {t("My Sent Deals")}
          </button>
        </div>

        {activeTab === "send" ? (
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
              {editingDeal ? t("Edit Deal") : t("Create New Deal")}
            </h2>
            <form
              onSubmit={editingDeal ? handleUpdateDeal : handleCreateDeal}
              className="space-y-4"
            >
              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Player")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="player_id"
                  value={formData.player_id}
                  onChange={handleInputChange}
                  disabled={!!editingDeal}
                  className={`w-full rounded-lg px-4 py-2 outline-none border ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                      : "bg-white border-gray-300 text-black focus:border-yellow-400"
                  } ${errors.player_id ? "border-red-500" : ""}`}
                  required
                >
                  <option value="">{t("Select Player")}</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.first_name} {player.last_name}
                    </option>
                  ))}
                </select>
                {errors.player_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.player_id}
                  </p>
                )}
              </div>

              {selectedPlayer && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-3 ${
                    isDark
                      ? "bg-[#051139]/50 border border-blue-900/30"
                      : "bg-gray-50 border"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    <User size={18} className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedPlayer.first_name} {selectedPlayer.last_name}
                    </p>
                    <div className="flex text-yellow-400 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                      <span className="text-gray-500 ml-1">
                        {selectedPlayer.average_rating?.toFixed(1) || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Offer Type")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="offer_type"
                  value={formData.offer_type}
                  onChange={handleInputChange}
                  disabled={!!editingDeal}
                  className={`w-full rounded-lg px-4 py-2 outline-none border ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                      : "bg-white border-gray-300 text-black focus:border-yellow-400"
                  }`}
                >
                  <option value="TRANSFER">{t("Transfer")}</option>
                  <option value="LOAN">{t("Loan")}</option>
                  <option value="TRIAL">{t("Trial")}</option>
                </select>
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
                  className={`w-full rounded-lg px-4 py-2 outline-none border resize-none ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                      : "bg-white border-gray-300 text-black focus:border-yellow-400"
                  }`}
                  placeholder={t("Describe the deal offer...")}
                />
              </div>

              <div>
                <label
                  className={`block text-sm mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t("Club Name")}
                </label>
                <input
                  type="text"
                  name="club_name"
                  value={formData.club_name}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg px-4 py-2 outline-none border ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                      : "bg-white border-gray-300 text-black focus:border-yellow-400"
                  }`}
                  placeholder={t("Your club name")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("Value (USD)")}
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg px-4 py-2 outline-none border ${
                      isDark
                        ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                        : "bg-white border-gray-300 text-black focus:border-yellow-400"
                    }`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {t("Commission Rate")} (%){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="commission_rate"
                    value={formData.commission_rate}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg px-4 py-2 outline-none border ${
                      isDark
                        ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                        : "bg-white border-gray-300 text-black focus:border-yellow-400"
                    } ${errors.commission_rate ? "border-red-500" : ""}`}
                    placeholder="15"
                    min="10"
                    max="30"
                  />
                  {errors.commission_rate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.commission_rate}
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
                  {t("Expiry Date")}
                </label>
                <input
                  type="date"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg px-4 py-2 outline-none border ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2a5a] text-white focus:border-yellow-400"
                      : "bg-white border-gray-300 text-black focus:border-yellow-400"
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`flex-1 py-2 rounded-md transition ${
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
                  className={`flex-1 py-2 rounded-md transition ${
                    isDark
                      ? "bg-yellow-400 text-black hover:bg-yellow-500"
                      : "bg-[#F0B100] text-black hover:bg-yellow-500"
                  } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {processing ? (
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  ) : editingDeal ? (
                    t("Update Deal")
                  ) : (
                    t("Send Deal")
                  )}
                </button>
              </div>
            </form>
          </div>
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
                        "EXPIRED",
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
                                  : status === "EXPIRED"
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

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-yellow-500" />
              </div>
            ) : filteredDeals.length === 0 ? (
              <div
                className={`text-center py-20 rounded-xl ${
                  isDark ? "bg-[#0a1128]" : "bg-white shadow"
                }`}
              >
                <Send size={48} className="mx-auto mb-4 text-gray-500" />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {statusFilter === "ALL"
                    ? t("No deals sent yet")
                    : t(
                        `No ${getStatusLabel(
                          statusFilter,
                        ).toLowerCase()} deals found`,
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
                    {t("View all deals")}
                  </button>
                )}
                {statusFilter === "ALL" && (
                  <button
                    onClick={() => setActiveTab("send")}
                    className={`mt-4 px-4 py-2 rounded-md transition ${
                      isDark
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : "bg-[#F0B100] text-black hover:bg-yellow-500"
                    }`}
                  >
                    {t("Send your first deal")}
                  </button>
                )}
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className={`p-4 rounded-xl transition ${
                    isDark
                      ? "bg-[#0a1128] border border-[#0f2b63]"
                      : "bg-white border border-gray-200 shadow"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{deal.playerName}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            deal.status,
                          )} bg-opacity-10`}
                        >
                          {deal.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-yellow-500 flex items-center gap-1">
                          <span>{getOfferTypeIcon(deal.offer_type)}</span>
                          <span>{deal.offer_type}</span>
                        </span>
                        {deal.club_name && (
                          <span className="flex items-center gap-1">
                            <Building2 size={14} /> {deal.club_name}
                          </span>
                        )}
                        {deal.value && (
                          <span className="flex items-center gap-1 text-green-500">
                            <DollarSign size={14} />{" "}
                            {formatCurrency(deal.value)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {formatDate(deal.created_at)}
                        </span>
                      </div>
                      {deal.description && (
                        <p
                          className={`text-sm mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {deal.description.length > 150
                            ? `${deal.description.substring(0, 150)}...`
                            : deal.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isPending(deal.status) && (
                        <>
                          <button
                            onClick={() => handleEditDeal(deal)}
                            className={`p-2 rounded-md transition ${
                              isDark
                                ? "hover:bg-yellow-400/20"
                                : "hover:bg-gray-100"
                            }`}
                            title={t("Edit Deal")}
                          >
                            <Edit size={18} className="text-yellow-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(deal)}
                            disabled={processing}
                            className={`p-2 rounded-md transition ${
                              isDark
                                ? "hover:bg-red-500/20"
                                : "hover:bg-gray-100"
                            }`}
                            title={t("Delete Deal")}
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        </>
                      )}
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
          setDealToDelete(null);
        }}
        onConfirm={confirmDelete}
        dealTitle={dealToDelete?.playerName || ""}
        isDark={isDark}
        t={t}
      />
    </div>
  );
}
