"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  User,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
import { GET_MY_CLUB_LEGAL_STATUS } from "@/app/graphql/query/legal-verification.queries";
import { UPDATE_MY_CLUB_LEGAL_STATUS } from "@/app/graphql/mutation/legal-verification.mutations";

interface ClubLegalData {
  id: string;
  is_officially_licensed: boolean;
  commercial_register_id?: string | null;
}

export default function ClubLegalStatusPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [isOfficiallyLicensed, setIsOfficiallyLicensed] = useState<boolean>(false);
  const [commercialRegisterId, setCommercialRegisterId] = useState<string>("");

  const fetchStatus = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ myClubLegalStatus: ClubLegalData | null }>(
        GET_MY_CLUB_LEGAL_STATUS,
      );
      if (result.data?.myClubLegalStatus) {
        const info = result.data.myClubLegalStatus;
        setIsOfficiallyLicensed(!!info.is_officially_licensed);
        setCommercialRegisterId(info.commercial_register_id || "");
      }
    } catch (err) {
      console.error("Error fetching club legal status:", err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isOfficiallyLicensed && !commercialRegisterId.trim()) {
      toast.error(t("Please enter your Commercial Register / License Number"));
      return;
    }

    setLoading(true);

    try {
      const result = await fetchGraphQL(UPDATE_MY_CLUB_LEGAL_STATUS, {
        input: {
          is_officially_licensed: isOfficiallyLicensed,
          commercial_register_id: isOfficiallyLicensed ? commercialRegisterId.trim() : null,
        },
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else {
        toast.success(t("Legal verification saved successfully!"));
        router.push("/clubprofile");
      }
    } catch (err) {
      console.error("Error updating club legal status:", err);
      toast.error(t("Failed to save legal verification"));
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#050729]" : "bg-gray-50"}`}>
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-40 transition ${
        isDark ? "bg-[#050729] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <h1 className="text-center text-3xl font-bold mb-5 text-yellow-400">
        {t("Legal Status")}
      </h1>
      
      <div className="max-w-6xl mx-auto px-6">
        {/* User + Legal Status Icons with Line */}
        <div className="flex justify-center items-center gap-6 mb-10">
          {/* User Profile Icon */}
          <button
            onClick={() => router.push("/clubprofile/profile")}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105 ${
              isDark
                ? "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
                : "border-yellow-400/50 bg-yellow-100/50 hover:bg-yellow-100"
            }`}
            title={t("Club Profile")}
          >
            <User
              className={`${isDark ? "text-yellow-500" : "text-yellow-600"}`}
              size={30}
            />
          </button>

          {/* Line between icons */}
          <div className={`w-12 h-[2px] ${isDark ? "bg-yellow-500/30" : "bg-yellow-400/50"}`} />

          {/* Legal Status Icon - الحالية */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
              isDark
                ? "bg-yellow-500/20 border-yellow-500"
                : "bg-yellow-100 border-yellow-400"
            }`}
          >
            <ShieldCheck
              className={`${isDark ? "text-yellow-500" : "text-yellow-600"}`}
              size={30}
            />
          </div>
        </div>

        <div className={`rounded-2xl p-8 border shadow-xl ${isDark ? "bg-[#0b1736] border-[#1e2d5a]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b ${isDark ? 'border-[#1e2d5a]' : 'border-gray-200'}">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">{t("Legal Verification")}</h2>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {t("legalTermsSubtitle")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`p-6 rounded-xl border ${isDark ? "bg-[#090b6e]/20 border-[#1e2d5a]" : "bg-gray-50 border-gray-200"}`}>
              <h3 className="text-lg font-semibold mb-4 text-yellow-400 flex items-center gap-2">
                <Building2 size={20} />
                {t("clubHeader")}
              </h3>

              <label className="flex items-start gap-4 cursor-pointer p-4 rounded-lg hover:bg-yellow-400/5 transition">
                <input
                  type="checkbox"
                  checked={isOfficiallyLicensed}
                  onChange={(e) => setIsOfficiallyLicensed(e.target.checked)}
                  className="w-6 h-6 mt-1 accent-yellow-400 rounded"
                />
                <span className={`text-base font-medium leading-relaxed ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {t("clubCheckbox")}
                </span>
              </label>

              {isOfficiallyLicensed && (
                <div className="mt-6 pt-4 border-t ${isDark ? 'border-[#1e2d5a]' : 'border-gray-200'}">
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    🆔 {t("commercialRegisterIdLabel")} *
                  </label>
                  <input
                    type="text"
                    value={commercialRegisterId}
                    onChange={(e) => setCommercialRegisterId(e.target.value)}
                    placeholder={t("commercialRegisterIdPlaceholder")}
                    required={isOfficiallyLicensed}
                    className={`w-full rounded-xl px-4 py-3 border outline-none text-base transition ${
                      isDark
                        ? "bg-[#0b1736] border-[#1e2d5a] text-white focus:border-yellow-400"
                        : "bg-white border-gray-300 text-black focus:border-yellow-400"
                    }`}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={() => router.push("/clubprofile/profile")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-medium transition ${
                  isDark
                    ? "text-gray-300 bg-[#090b6e]/20 border-gray-600 hover:bg-[#090b6e]/40"
                    : "text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                {t("Back to Profile")}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {t("Save Legal Status")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}