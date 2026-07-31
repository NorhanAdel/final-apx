"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import {
  FileText,
  ShieldCheck,
  Calendar,
  DollarSign,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  User,
  Briefcase,
  Trophy,
  Camera,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
import { GET_MY_CONTRACT_STATUS } from "@/app/graphql/query/contract-status.queries";
import { UPDATE_MY_CONTRACT_STATUS } from "@/app/graphql/mutation/contract-status.mutations";

interface ContractStatusData {
  id: string;
  contract_status: string;
  contract_status_label?: string;
  contract_end_date?: string | null;
  release_clause_amount?: number | null;
  has_official_agent: boolean;
  official_agent_name?: string | null;
}

export default function ContractStatusPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [contractStatus, setContractStatus] = useState<string>("AMATEUR");
  const [contractEndDate, setContractEndDate] = useState<string>("");
  const [releaseClauseAmount, setReleaseClauseAmount] = useState<string>("");
  const [hasOfficialAgent, setHasOfficialAgent] = useState<boolean>(false);
  const [officialAgentName, setOfficialAgentName] = useState<string>("");

  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const fetchStatus = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ myContractStatus: ContractStatusData | null }>(
        GET_MY_CONTRACT_STATUS,
      );
      if (result.data?.myContractStatus) {
        const info = result.data.myContractStatus;
        setContractStatus(info.contract_status || "AMATEUR");
        if (info.contract_end_date) {
          const d = new Date(info.contract_end_date);
          if (!isNaN(d.getTime())) {
            setContractEndDate(d.toISOString().split("T")[0]);
          }
        }
        setReleaseClauseAmount(
          info.release_clause_amount != null ? info.release_clause_amount.toString() : "",
        );
        setHasOfficialAgent(!!info.has_official_agent);
        setOfficialAgentName(info.official_agent_name || "");
      }
    } catch (err) {
      console.error("Error fetching contract status:", err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!contractStatus) {
      toast.error(t("Please select your legal contract status"));
      return;
    }

    if (contractStatus === "UNDER_CONTRACT" && !contractEndDate) {
      toast.error(t("Please specify your current contract end date"));
      return;
    }

    if (hasOfficialAgent && !officialAgentName.trim()) {
      toast.error(t("Please enter your official agent name"));
      return;
    }

    setLoading(true);

    try {
      const input = {
        contract_status: contractStatus,
        contract_end_date:
          contractStatus === "UNDER_CONTRACT" && contractEndDate
            ? new Date(contractEndDate).toISOString()
            : null,
        release_clause_amount:
          contractStatus === "UNDER_CONTRACT" && releaseClauseAmount
            ? parseFloat(releaseClauseAmount)
            : null,
        has_official_agent: hasOfficialAgent,
        official_agent_name: hasOfficialAgent ? officialAgentName.trim() : null,
      };

      const result = await fetchGraphQL<{ updateMyContractStatus: ContractStatusData }>(
        UPDATE_MY_CONTRACT_STATUS,
        { input },
      );

      if (result.data?.updateMyContractStatus) {
        toast.success(t("Legal contract status saved successfully!"));
        router.push("/profile/imagesreels");
      } else if (result.errors?.[0]?.message) {
        toast.error(result.errors[0].message);
      }
    } catch (err) {
      console.error("Error saving contract status:", err);
      toast.error(t("Failed to save legal contract status"));
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    {
      value: "AMATEUR",
      title: t("Amateur Player"),
      desc: t("Amateur Player Description"),
    },
    {
      value: "FREE_AGENT",
      title: t("Free Agent"),
      desc: t("Free Agent Description"),
    },
    {
      value: "AVAILABLE_FOR_LOAN",
      title: t("Available for Loan"),
      desc: t("Available for Loan Description"),
    },
    {
      value: "UNDER_CONTRACT",
      title: t("Under Official Contract"),
      desc: t("Under Official Contract Description"),
    },
  ];

  if (pageLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617]" : "bg-gray-50"
        }`}
      >
        <Loader2
          className={`animate-spin ${isDark ? "text-white" : "text-black"}`}
          size={48}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-30 transition ${
        isDark ? "bg-[#020617]" : "bg-gray-50 text-black"
      }`}
    >
      <div className="relative w-full max-w-6xl mx-auto px-6">
        <h1 className="text-center text-3xl font-bold text-yellow-400 mb-10">
          {t("Legal Contract Status")}
        </h1>

        <div className="flex items-center justify-center gap-6 mb-12">
          <Step
            icon={<User size={22} />}
            isDark={isDark}
            onClick={() => router.push("/profile")}
          />
          <Line isDark={isDark} />
          <Step
            icon={<Trophy size={22} />}
            isDark={isDark}
            onClick={() => router.push("/profile/football")}
          />
          <Line isDark={isDark} />
          <Step
            icon={<Briefcase size={22} />}
            isDark={isDark}
            onClick={() => router.push("/profile/clubcareer")}
          />
          <Line isDark={isDark} />
          <Step
            active
            icon={<ShieldCheck size={22} />}
            isDark={isDark}
            onClick={() => router.push("/profile/legal-status")}
          />
          <Line isDark={isDark} />
          <Step
            icon={<Camera size={22} />}
            isDark={isDark}
            onClick={() => router.push("/profile/imagesreels")}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div
            className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-xl space-y-6 ${
              isDark ? "bg-[#030816]/90 border-white/10" : "bg-white border-gray-200 shadow-xl"
            }`}
          >
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-yellow-400">
              <FileText size={20} />
              <span>{t("What is your current legal or contractual status?")}</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {statusOptions.map((opt) => {
                const isSelected = contractStatus === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setContractStatus(opt.value)}
                    className={`cursor-pointer p-4 sm:p-5 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-400/10 shadow-md shadow-yellow-400/10"
                        : isDark
                        ? "border-white/5 bg-[#060d1f] hover:border-white/20"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? "border-yellow-400 bg-yellow-400 text-black" : "border-gray-500"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="fill-black text-yellow-400" />}
                    </div>
                    <div className="space-y-1">
                      <h4 className={`text-sm sm:text-base font-bold ${isSelected ? "text-yellow-400" : ""}`}>
                        {opt.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {contractStatus === "UNDER_CONTRACT" && (
              <div
                className={`p-5 rounded-xl border mt-6 space-y-5 animate-in fade-in slide-in-from-top-4 duration-300 ${
                  isDark ? "bg-[#071126] border-yellow-400/30" : "bg-yellow-50/50 border-yellow-400/30"
                }`}
              >
                <h4 className="text-xs sm:text-sm font-bold text-yellow-400 uppercase tracking-wider">
                  {t("Current contract details")}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-gray-300">
                      <Calendar size={14} className="text-yellow-400" />
                      <span>{t("Contract End Date")}</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={contractEndDate}
                      onChange={(e) => setContractEndDate(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-bold border focus:outline-none focus:border-yellow-400 transition ${
                        isDark ? "bg-[#030816] border-white/10 text-white" : "bg-white border-gray-300 text-black"
                      }`}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold flex items-center gap-1.5 text-gray-300">
                      <DollarSign size={14} className="text-yellow-400" />
                      <span>{t("Release Clause Value")}</span>
                    </label>
                    <input
                      type="number"
                      placeholder={t("Enter the release clause amount...")}
                      value={releaseClauseAmount}
                      onChange={(e) => setReleaseClauseAmount(e.target.value)}
                      className={`w-full rounded-xl py-2.5 px-4 text-xs font-bold border focus:outline-none focus:border-yellow-400 transition ${
                        isDark ? "bg-[#030816] border-white/10 text-white" : "bg-white border-gray-300 text-black"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-xl space-y-6 ${
              isDark ? "bg-[#030816]/90 border-white/10" : "bg-white border-gray-200 shadow-xl"
            }`}
          >
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-yellow-400">
              <UserCheck size={20} />
              <span>{t("Do you have an official agent?")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setHasOfficialAgent(true)}
                className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-3 ${
                  hasOfficialAgent ? "border-yellow-400 bg-yellow-400/10" : isDark ? "border-white/5 bg-[#060d1f]" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    hasOfficialAgent ? "border-yellow-400 bg-yellow-400 text-black" : "border-gray-500"
                  }`}
                >
                  {hasOfficialAgent && <CheckCircle2 size={14} className="fill-black text-yellow-400" />}
                </div>
                <span className="text-xs sm:text-sm font-bold">
                  {t("Yes (I have an official agent)")}
                </span>
              </div>

              <div
                onClick={() => {
                  setHasOfficialAgent(false);
                  setOfficialAgentName("");
                }}
                className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center gap-3 ${
                  !hasOfficialAgent ? "border-yellow-400 bg-yellow-400/10" : isDark ? "border-white/5 bg-[#060d1f]" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    !hasOfficialAgent ? "border-yellow-400 bg-yellow-400 text-black" : "border-gray-500"
                  }`}
                >
                  {!hasOfficialAgent && <CheckCircle2 size={14} className="fill-black text-yellow-400" />}
                </div>
                <span className="text-xs sm:text-sm font-bold">
                  {t("No (I represent myself legally)")}
                </span>
              </div>
            </div>

            {hasOfficialAgent && (
              <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-gray-300">
                  {t("Agent Name")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("Enter the agent or agency name...")}
                  value={officialAgentName}
                  onChange={(e) => setOfficialAgentName(e.target.value)}
                  className={`w-full rounded-xl py-3 px-4 text-xs font-bold border focus:outline-none focus:border-yellow-400 transition ${
                    isDark ? "bg-[#060d1f] border-white/10 text-white" : "bg-white border-gray-300 text-black"
                  }`}
                  required
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex justify-between mt-12">
            <button
              type="button"
              onClick={() => router.push("/profile/clubcareer")}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg transition ${
                isDark
                  ? "bg-[#081f55] border-x border-yellow-400 hover:bg-[#0b2b6b] text-white"
                  : "bg-gray-200 border-x border-yellow-400 hover:bg-gray-300 text-black"
              }`}
            >
              <ChevronLeft size={20} className={isRTL ? "rotate-180" : ""} /> {t("Previous")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-10 py-3 rounded-lg transition font-bold ${
                isDark
                  ? "bg-[#081f55] border-x border-yellow-400 hover:bg-[#0b2b6b] text-yellow-400"
                  : "bg-gray-200 border-x border-yellow-400 hover:bg-gray-300 text-yellow-600"
              } disabled:opacity-50`}
            >
              {loading ? t("Saving...") : t("Next")}{" "}
              <ChevronRight size={20} className={isRTL ? "rotate-180" : ""} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Step({
  icon,
  active,
  isDark,
  onClick,
}: {
  icon: React.ReactNode;
  active?: boolean;
  isDark: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${
        active
          ? "bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]"
          : isDark
          ? "bg-[#0f1c3d] text-gray-400 hover:bg-[#1a2a4d]"
          : "bg-gray-200 text-gray-500 hover:bg-gray-300"
      }`}
    >
      {icon}
    </button>
  );
}

function Line({ isDark }: { isDark: boolean }) {
  return (
    <div className={`w-16 h-[2px] ${isDark ? "bg-gray-500" : "bg-gray-300"}`} />
  );
}