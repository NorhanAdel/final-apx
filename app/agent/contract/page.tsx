"use client";

import { Download, ChevronRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/navigation";
import useTranslate from "../../hooks/useTranslate";
import { useState, useEffect } from "react";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { GET_MY_CONTRACT_TEMPLATE } from "@/app/graphql/query/contract.queries";
import { toast } from "sonner";
import BackButton from "@/app/components/BackButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ContractPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const router = useRouter();
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const result = await fetchGraphQL<{ myContractTemplate: string }>(
          GET_MY_CONTRACT_TEMPLATE,
        );
        if (result.data?.myContractTemplate) {
          const fullUrl = result.data.myContractTemplate.startsWith("http")
            ? result.data.myContractTemplate
            : `${API_URL}${result.data.myContractTemplate}`;
          setTemplateUrl(fullUrl);
        } else if (result.errors) {
          toast.error(
            result.errors[0]?.message || t("Failed to load template"),
          );
        }
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [t]);

  const handleDownload = () => {
    if (templateUrl) {
      console.log("Downloading from:", templateUrl);

      // Create hidden anchor element
      const link = document.createElement("a");
      link.href = templateUrl;
      link.download = "contract-template.pdf"; // This forces download instead of open
      link.target = "_blank";

      // Alternative: Use fetch to get blob and then download
      fetch(templateUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = blobUrl;
          downloadLink.download = "contract-template.pdf";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch((error) => {
          console.error("Error downloading file:", error);
          toast.error(t("Failed to download contract"));
        });
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

  return (
    <div
      className={`min-h-screen flex justify-center items-center px-6 relative overflow-hidden font-sans transition
      ${
        theme === "dark" ? "bg-[#020617] text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Background blur */}
      <div
        className={`absolute w-[800px] h-[800px] rounded-full -left-40 -top-40 blur-[150px]
          ${theme === "dark" ? "bg-blue-900/10" : "bg-yellow-200/20"}`}
      />
      <div
        className={`absolute w-[600px] h-[600px] rounded-full -right-20 -bottom-20 blur-[120px]
          ${theme === "dark" ? "bg-blue-800/5" : "bg-yellow-300/20"}`}
      />

      <div className="max-w-5xl w-full relative z-10">
        <BackButton className="mb-6" />
        <h1
          className={`text-4xl font-black italic mb-12 uppercase tracking-tighter text-center
          ${theme === "dark" ? "text-[#FFD700]" : "text-yellow-600"}`}
        >
          {t("Contract")}
        </h1>

        {/* Card */}
        <div className="w-full relative mb-6">
          <div
            className={`flex items-center justify-between p-4 px-8 rounded-sm shadow-2xl
            ${
              theme === "dark"
                ? "bg-[#020617] border-x-4 border-[#FFD700]"
                : "bg-white border-x-4 border-yellow-500"
            }`}
          >
            <div className="flex items-center gap-4">
              <Download
                className={
                  theme === "dark" ? "text-[#FFD700]" : "text-yellow-600"
                }
                size={24}
              />
              <span className="text-lg font-black italic uppercase tracking-tight">
                {t("Download Contract PDF")}
              </span>
            </div>

            <button
              onClick={handleDownload}
              disabled={!templateUrl}
              className={`px-6 py-2 rounded-md font-black italic uppercase text-sm flex items-center gap-2 transition-all active:scale-95
                ${
                  !templateUrl
                    ? "opacity-50 cursor-not-allowed"
                    : theme === "dark"
                    ? "bg-[#001a4d] border border-[#FFD700] text-white hover:bg-[#002b80]"
                    : "bg-yellow-400 border border-yellow-600 text-black hover:bg-yellow-500"
                }`}
            >
              {t("Download")}
              <Download
                size={16}
                className={theme === "dark" ? "text-[#FFD700]" : "text-black"}
              />
            </button>
          </div>
        </div>

        {/* Next */}
        <button
          onClick={() => router.push("/agent/uploadcontract")}
          className={`w-full py-4 rounded border-x-4 flex items-center justify-center gap-3 text-2xl font-black italic uppercase tracking-widest transition-all
          ${
            theme === "dark"
              ? "bg-[#021448] border-[#FFD700] text-white hover:bg-[#001a4d]"
              : "bg-yellow-300 border-yellow-500 text-black hover:bg-yellow-400"
          }`}
        >
          {t("Next")}
          <ChevronRight
            size={28}
            className={
              theme === "dark"
                ? "text-[#FFD700] stroke-[4px]"
                : "text-black stroke-[4px]"
            }
          />
        </button>
      </div>
    </div>
  );
}
