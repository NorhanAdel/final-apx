"use client";

import {
  FileText,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  History,
  Upload,
  AlertCircle,
} from "lucide-react";
import {
  GET_MY_CONTRACT,
  GET_MY_CONTRACTS,
} from "@/app/graphql/query/contract.queries";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import BackButton from "@/app/components/BackButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Contract {
  id: string;
  user_id: string;
  role: string;
  contract_url: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  updated_at: string;
}

export default function MyContractPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [contractsHistory, setContractsHistory] = useState<Contract[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current contract
        const currentResult = await fetchGraphQL<{ myContract: Contract }>(
          GET_MY_CONTRACT,
        );
        if (currentResult.data?.myContract) {
          setCurrentContract(currentResult.data.myContract);
        }

        // Fetch contracts history
        const historyResult = await fetchGraphQL<{ myContracts: Contract[] }>(
          GET_MY_CONTRACTS,
        );
        if (historyResult.data?.myContracts) {
          setContractsHistory(historyResult.data.myContracts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(t("Failed to load contract data"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleDownloadContract = (url: string, filename?: string) => {
    if (!url) return;

    // Build full URL if it's a relative path
    const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

    console.log("Downloading from:", fullUrl);

    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = filename || "contract.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("pending")) return "text-yellow-500";
    if (lowerStatus.includes("approved")) return "text-green-500";
    if (lowerStatus.includes("rejected")) return "text-red-500";
    return "text-gray-400";
  };

  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("pending"))
      return <Clock size={16} className="text-yellow-500" />;
    if (lowerStatus.includes("approved"))
      return <CheckCircle size={16} className="text-green-500" />;
    if (lowerStatus.includes("rejected"))
      return <XCircle size={16} className="text-red-500" />;
    return null;
  };

  const getStatusText = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("pending")) return t("Pending");
    if (lowerStatus.includes("approved")) return t("Approved");
    if (lowerStatus.includes("rejected")) return t("Rejected");
    return status;
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

  if (loading) {
    return (
      <div
        className={`min-h-screen flex justify-center items-center transition
        ${
          theme === "dark"
            ? "bg-[#020617] text-white"
            : "bg-gray-100 text-black"
        }`}
      >
        <div className="text-yellow-400">{t("Loading...")}</div>
      </div>
    );
  }

  // Check if user has no contract at all
  const hasNoContract = !currentContract && contractsHistory.length === 0;

  return (
    <div
      className={`min-h-screen py-40 transition
      ${
        theme === "dark" ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-4xl mx-auto px-6">
        <BackButton className="mb-6" />

        <h1
          className={`text-3xl font-bold mb-8 text-center
          ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}
        >
          {t("My Contract")}
        </h1>

        {/* No Contract State */}
        {hasNoContract && (
          <div
            className={`p-12 rounded-xl text-center border-2 border-dashed
            ${
              theme === "dark"
                ? "bg-[#0b1736]/50 border-yellow-500/30"
                : "bg-white border-yellow-400/50"
            }`}
          >
            <div
              className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center
              ${theme === "dark" ? "bg-yellow-500/10" : "bg-yellow-100"}`}
            >
              <AlertCircle
                size={40}
                className={
                  theme === "dark" ? "text-yellow-400" : "text-yellow-500"
                }
              />
            </div>
            <h2
              className={`text-2xl font-bold mb-3
              ${theme === "dark" ? "text-white" : "text-gray-800"}`}
            >
              {t("No Contract Found")}
            </h2>
            <p
              className={`mb-8
              ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {t(
                "You haven't uploaded any contract yet. Please download and sign the contract template first.",
              )}
            </p>
            <button
              onClick={() => router.push("/profile/contract")}
              className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto transition
              ${
                theme === "dark"
                  ? "bg-yellow-400 text-black hover:bg-yellow-500"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
            >
              <FileText size={18} />
              {t("Download Contract Template")}
            </button>
          </div>
        )}

        {/* Current Contract Section - Only show if contract exists */}
        {!hasNoContract && (
          <>
            <div className="mb-8">
              <h2
                className={`text-xl font-semibold mb-4
                ${theme === "dark" ? "text-white" : "text-gray-800"}`}
              >
                {t("Current Contract")}
              </h2>

              {currentContract ? (
                <div
                  className={`p-6 rounded-xl shadow-lg border
                  ${
                    theme === "dark"
                      ? "bg-[#0b1736] border-[#1e2d5a]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg
                        ${
                          theme === "dark"
                            ? "bg-yellow-500/10"
                            : "bg-yellow-100"
                        }`}
                      >
                        <FileText
                          size={24}
                          className={
                            theme === "dark"
                              ? "text-yellow-400"
                              : "text-yellow-600"
                          }
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">{t("Role")}</p>
                        <p className="font-medium">{currentContract.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(currentContract.status)}
                      <span
                        className={`font-medium ${getStatusColor(
                          currentContract.status,
                        )}`}
                      >
                        {getStatusText(currentContract.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-400">{t("Submitted")}:</span>
                      <span className="ml-2">
                        {formatDate(currentContract.created_at)}
                      </span>
                    </div>
                    {currentContract.reviewed_at && (
                      <div>
                        <span className="text-gray-400">{t("Reviewed")}:</span>
                        <span className="ml-2">
                          {formatDate(currentContract.reviewed_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {currentContract.rejection_reason && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-sm text-red-400">
                        <span className="font-medium">
                          {t("Rejection Reason")}:
                        </span>{" "}
                        {currentContract.rejection_reason}
                      </p>
                    </div>
                  )}

                  {currentContract.contract_url && (
                    <button
                      onClick={() =>
                        handleDownloadContract(currentContract.contract_url)
                      }
                      className={`mt-2 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition
                      ${
                        theme === "dark"
                          ? "bg-[#001a4d] border border-yellow-400 text-white hover:bg-[#002b80]"
                          : "bg-yellow-400 text-black hover:bg-yellow-500"
                      }`}
                    >
                      <Download size={16} />
                      {t("Download Signed Contract")}
                    </button>
                  )}
                </div>
              ) : (
                // No current contract but has history
                <div
                  className={`p-8 rounded-xl text-center
                  ${
                    theme === "dark"
                      ? "bg-[#0b1736] text-gray-400"
                      : "bg-white text-gray-500"
                  }`}
                >
                  <FileText size={48} className="mx-auto mb-3 opacity-50" />
                  <p>{t("No active contract found")}</p>
                  <button
                    onClick={() => router.push("/profile/contract")}
                    className={`mt-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto transition
                    ${
                      theme === "dark"
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                    }`}
                  >
                    <Upload size={14} />
                    {t("Upload New Contract")}
                  </button>
                </div>
              )}
            </div>

            {/* History Section */}
            {contractsHistory.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition
                  ${
                    theme === "dark"
                      ? "bg-[#0b1736] hover:bg-[#0f1d4a]"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <History size={20} className="text-yellow-400" />
                    <span className="font-medium">{t("Contract History")}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full
                      ${
                        theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {contractsHistory.length}
                    </span>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`transition-transform ${
                      showHistory ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {showHistory && (
                  <div className="mt-4 space-y-3">
                    {contractsHistory.map((contract) => (
                      <div
                        key={contract.id}
                        className={`p-4 rounded-xl border
                        ${
                          theme === "dark"
                            ? "bg-[#0b1736]/50 border-[#1e2d5a]"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <FileText
                              size={18}
                              className={
                                theme === "dark"
                                  ? "text-yellow-400"
                                  : "text-yellow-600"
                              }
                            />
                            <span className="text-sm font-medium">
                              {contract.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(contract.status)}
                            <span
                              className={`text-sm ${getStatusColor(
                                contract.status,
                              )}`}
                            >
                              {getStatusText(contract.status)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
                          <div className="text-gray-400">
                            {formatDate(contract.created_at)}
                          </div>
                          {contract.contract_url && (
                            <button
                              onClick={() =>
                                handleDownloadContract(
                                  contract.contract_url,
                                  `contract-${contract.id}.pdf`,
                                )
                              }
                              className={`text-sm flex items-center gap-1 transition
                              ${
                                theme === "dark"
                                  ? "text-yellow-400 hover:text-yellow-300"
                                  : "text-yellow-600 hover:text-yellow-700"
                              }`}
                            >
                              <Download size={14} />
                              {t("Download")}
                            </button>
                          )}
                        </div>

                        {contract.rejection_reason && (
                          <p className="mt-2 text-xs text-red-400">
                            {t("Reason")}: {contract.rejection_reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Upload Button (if no approved contract) */}
            {(!currentContract ||
              currentContract.status?.toLowerCase() !== "approved") && (
              <button
                onClick={() => router.push("/profile/contract")}
                className={`w-full mt-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition
                ${
                  theme === "dark"
                    ? "bg-yellow-400 text-black hover:bg-yellow-500"
                    : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
              >
                <Upload size={18} />
                {currentContract?.status?.toLowerCase() === "rejected"
                  ? t("Re-upload Contract")
                  : t("Upload Contract")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
