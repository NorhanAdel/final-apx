"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  ChevronRight
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useTranslate from "../../hooks/useTranslate";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import { uploadGraphQL } from "../../lib/uploadGraphQL";
import { GET_MY_CONTRACT } from "@/app/graphql/query/contract.queries";
import { UPLOAD_SIGNED_CONTRACT } from "@/app/graphql/mutation/contract.mutations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";

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

export default function UploadContractPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myContract, setMyContract] = useState<Contract | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch contract template URL and existing contract
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch existing contract
        const contractResult = await fetchGraphQL<{ myContract: Contract }>(
          GET_MY_CONTRACT,
        );
        if (contractResult.data?.myContract) {
          setMyContract(contractResult.data.myContract);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error(t("Please upload a PDF file"));
        return;
      }
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error(t("Please select a file to upload"));
      return;
    }

    const file = fileInputRef.current.files[0];

    setUploading(true);
    try {
      const result = await uploadGraphQL<{ uploadSignedContract: Contract }>(
        UPLOAD_SIGNED_CONTRACT,
        { file },
      );

      if (result.data?.uploadSignedContract) {
        toast.success(t("Contract uploaded successfully!"));
        setFileName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Refresh contract data
        const contractResult = await fetchGraphQL<{ myContract: Contract }>(
          GET_MY_CONTRACT,
        );
        if (contractResult.data?.myContract) {
          setMyContract(contractResult.data.myContract);
        }
        // Redirect back to contract page
        router.push("/clubprofile/mycontract");
      } else if (result.errors) {
        toast.error(result.errors[0]?.message || t("Upload failed"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("Failed to upload contract"));
    } finally {
      setUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
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

  // If contract is approved, redirect back
  if (myContract?.status?.toLowerCase() === "approved") {
    router.push("/clubprofile/contract");
    return null;
  }

  return (
    <div
      className={`min-h-screen flex justify-center items-center px-6 relative overflow-hidden py-38 font-sans transition
      ${
        theme === "dark" ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"
      }`}
    >
      <div className="absolute w-[800px] h-[800px] bg-blue-900/10 blur-[150px] rounded-full -left-40 -top-40 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-blue-800/5 blur-[120px] rounded-full -right-20 -bottom-20 pointer-events-none" />

      <div className="max-w-5xl w-full relative z-10">
        <BackButton className="mb-6" />

        <h1
          className={`text-4xl font-black italic mb-6 uppercase tracking-tighter text-center
          ${theme === "dark" ? "text-[#FFD700]" : "text-[#F0B100]"}`}
        >
          {t("Contract")}
        </h1>

        <p
          className={`text-lg font-black italic uppercase mb-4 tracking-tight
          ${theme === "dark" ? "text-white" : "text-gray-700"}`}
        >
          {myContract?.status?.toLowerCase() === "rejected"
            ? t("Re-upload Signed Contract")
            : t("Upload Signed Contract")}
        </p>

        <div className="w-full relative mb-8">
          <div
            onClick={triggerUpload}
            className={`rounded-lg flex flex-col items-center justify-center py-20 px-8 shadow-2xl cursor-pointer transition-all group
            ${
              theme === "dark"
                ? "bg-[#000d26] border border-[#FDC700] hover:bg-[#00143a]"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="application/pdf"
            />

            <div className="relative mb-4">
              <FileText
                size={64}
                className={`transition-colors
                ${
                  theme === "dark"
                    ? "text-gray-500 group-hover:text-[#FFD700]"
                    : "text-gray-400 group-hover:text-[#F0B100]"
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-[10px] font-bold rounded px-1 mt-1 transition-colors
                  ${
                    theme === "dark"
                      ? "text-gray-900 bg-gray-500 group-hover:bg-[#FFD700]"
                      : "text-white bg-gray-400 group-hover:bg-[#F0B100]"
                  }`}
                >
                  PDF
                </span>
              </div>
            </div>

            <p
              className={`font-bold italic uppercase tracking-widest text-sm transition-colors
              ${
                theme === "dark"
                  ? "text-gray-400 group-hover:text-white"
                  : "text-gray-500 group-hover:text-black"
              }`}
            >
              {fileName ? fileName : t("Click To Upload Signed Contract")}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={handleUpload}
            disabled={uploading || !fileName}
            className={`w-full py-4 rounded text-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]
            ${
              uploading || !fileName
                ? "opacity-50 cursor-not-allowed"
                : theme === "dark"
                ? "bg-[#021448] border-x-4 border-[#FDC700] text-white hover:bg-[#001a4d]"
                : "bg-[#F0B100] text-black hover:bg-yellow-500"
            }`}
          >
            {uploading ? t("Uploading...") : t("Upload Contract")}
            <ChevronRight
              size={28}
              className={theme === "dark" ? "text-[#FFD700]" : "text-black"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
