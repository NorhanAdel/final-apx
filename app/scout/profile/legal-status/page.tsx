"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { Search, ChevronRight, ChevronLeft, Loader2, CheckCircle2, User, Building2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";
import { GET_MY_SCOUT_LEGAL_STATUS } from "@/app/graphql/query/legal-verification.queries";
import { UPDATE_MY_SCOUT_LEGAL_STATUS } from "@/app/graphql/mutation/legal-verification.mutations";

interface ScoutLegalData {
  id: string;
  scout_type: string;
  organization_name?: string | null;
}

function Step({
  icon,
  active,
  isDark,
}: {
  icon: React.ReactNode;
  active?: boolean;
  isDark: boolean;
}) {
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
        active
          ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]"
          : isDark
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-200 text-gray-500"
      }`}
    >
      {icon}
    </div>
  );
}

function Line({ isDark }: { isDark: boolean }) {
  return (
    <div className={`w-10 h-[2px] ${isDark ? "bg-gray-500" : "bg-gray-300"}`} />
  );
}

export default function ScoutLegalStatusPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [scoutType, setScoutType] = useState<string>("INDEPENDENT");
  const [organizationName, setOrganizationName] = useState<string>("");

  const fetchStatus = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ myScoutLegalStatus: ScoutLegalData | null }>(
        GET_MY_SCOUT_LEGAL_STATUS,
      );
      if (result.data?.myScoutLegalStatus) {
        const info = result.data.myScoutLegalStatus;
        setScoutType(info.scout_type || "INDEPENDENT");
        setOrganizationName(info.organization_name || "");
      }
    } catch (err) {
      console.error("Error fetching scout legal status:", err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (scoutType === "AFFILIATED" && !organizationName.trim()) {
      toast.error(t("Please enter the organization name"));
      return;
    }

    setLoading(true);

    try {
      const result = await fetchGraphQL(UPDATE_MY_SCOUT_LEGAL_STATUS, {
        input: {
          scout_type: scoutType,
          organization_name: scoutType === "AFFILIATED" ? organizationName.trim() : null,
        },
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else {
        toast.success(t("Legal verification saved successfully!"));
        router.push("/scout");
      }
    } catch (err) {
      console.error("Error updating scout legal status:", err);
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
    <div className={`min-h-screen py-32 px-4 sm:px-6 lg:px-8 transition-colors ${isDark ? "bg-[#050729] text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-center text-3xl font-bold mb-10 text-yellow-400">
          {t("Legal Status")}
        </h1>

        {/* 3 Steps Navigation Bar */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <button
            type="button"
            onClick={() => router.push("/scout/profile")}
            className="cursor-pointer"
          >
            <Step icon={<User />} isDark={isDark} />
          </button>
          <Line isDark={isDark} />
          <button
            type="button"
            onClick={() => router.push("/scout/profile/clubcareer")}
            className="cursor-pointer"
          >
            <Step icon={<Building2 />} isDark={isDark} />
          </button>
          <Line isDark={isDark} />
          <Step icon={<ShieldCheck />} active isDark={isDark} />
        </div>

        <div className={`rounded-2xl p-8 border shadow-xl ${isDark ? "bg-[#0b1736] border-[#1e2d5a]" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700/30">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">{t("legalTermsTitle")}</h2>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {t("legalTermsSubtitle")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`p-6 rounded-xl border ${isDark ? "bg-[#090b6e]/20 border-[#1e2d5a]" : "bg-gray-50 border-gray-200"}`}>
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">
                {t("scoutHeader")}
              </h3>

              <div className="space-y-4">
                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-lg hover:bg-yellow-400/5 transition">
                  <input
                    type="radio"
                    name="scoutType"
                    value="INDEPENDENT"
                    checked={scoutType === "INDEPENDENT"}
                    onChange={(e) => setScoutType(e.target.value)}
                    className="w-5 h-5 mt-1 accent-yellow-400"
                  />
                  <span className={`text-base font-medium leading-relaxed ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    🔲 {t("scoutIndependent")}
                  </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-lg hover:bg-yellow-400/5 transition">
                  <input
                    type="radio"
                    name="scoutType"
                    value="AFFILIATED"
                    checked={scoutType === "AFFILIATED"}
                    onChange={(e) => setScoutType(e.target.value)}
                    className="w-5 h-5 mt-1 accent-yellow-400"
                  />
                  <span className={`text-base font-medium leading-relaxed ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    🔲 {t("scoutAffiliated")}
                  </span>
                </label>
              </div>

              {scoutType === "AFFILIATED" && (
                <div className="mt-6 pt-4 border-t border-gray-700/30">
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    📝 {t("organizationNameLabel")} *
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder={t("organizationNamePlaceholder")}
                    required
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
                onClick={() => router.push("/scout/profile/clubcareer")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border font-medium transition ${
                  isDark
                    ? "text-gray-300 bg-[#090b6e]/20 border-gray-600 hover:bg-[#090b6e]/40"
                    : "text-gray-700 bg-gray-100 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                {t("Back")}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {t("saveLegalStatus")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}