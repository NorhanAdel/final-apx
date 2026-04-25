"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  History,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  User,
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { toast } from "sonner";
import { UPSERT_CLUB_CAREER } from "@/app/graphql/mutation/Scout.mutations";
import { GET_MY_CLUB_CAREER } from "@/app/graphql/query/scout.queries";

interface ClubCareerData {
  id: string;
  current_club: string | null;
  previous_clubs: string | null;
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
          ? "bg-yellow-400 text-black"
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

export default function ScoutClubCareerPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    current_club: "",
    previous_clubs: "",
  });
  const [originalData, setOriginalData] = useState({
    current_club: "",
    previous_clubs: "",
  });

  useEffect(() => {
    fetchClubCareer();
  }, []);

  const fetchClubCareer = async () => {
    setPageLoading(true);
    try {
      const result = await fetchGraphQL<{ myScoutClubCareer: ClubCareerData }>(
        GET_MY_CLUB_CAREER,
      );

      if (result.data?.myScoutClubCareer) {
        const data = result.data.myScoutClubCareer;
        const newData = {
          current_club: data.current_club || "",
          previous_clubs: data.previous_clubs || "",
        };
        setFormData(newData);
        setOriginalData(newData);
      }
    } catch (error) {
      console.error("Error fetching club career:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return (
      formData.current_club !== originalData.current_club ||
      formData.previous_clubs !== originalData.previous_clubs
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges()) {
      router.push("/scout");
      return;
    }

    setLoading(true);

    try {
      const result = await fetchGraphQL<{
        upsertScoutClubCareer: ClubCareerData;
      }>(UPSERT_CLUB_CAREER, {
        input: {
          current_club: formData.current_club || null,
          previous_clubs: formData.previous_clubs || null,
        },
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data?.upsertScoutClubCareer) {
        const data = result.data.upsertScoutClubCareer;
        setOriginalData({
          current_club: data.current_club || "",
          previous_clubs: data.previous_clubs || "",
        });
        toast.success(t("Club career saved successfully!"));
        router.push("/scout");
      }
    } catch (error) {
      console.error("Error saving club career:", error);
      toast.error(t("Failed to save club career"));
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#020617]" : "bg-gray-100"
        }`}
      >
        <Loader2 size={40} className="animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-40 transition ${
        isDark ? "bg-[#020b1c] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <h1 className="text-center text-3xl font-bold mb-10 text-yellow-400">
        {t("Club Career")}
      </h1>

      <div className="max-w-4xl mx-auto px-6">
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <Step icon={<User />} isDark={isDark} />
          <Line isDark={isDark} />
          <Step icon={<Building2 />} active isDark={isDark} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Current Club */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("Current Club")}
            </label>
            <div
              className={`flex items-center rounded-xl px-4 py-3 border transition-colors ${
                isDark
                  ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
                  : "bg-white border-gray-300 focus-within:border-yellow-400"
              }`}
            >
              <Building2 size={18} className="text-yellow-400 mr-3" />
              <input
                type="text"
                value={formData.current_club}
                onChange={(e) => handleChange("current_club", e.target.value)}
                placeholder={t("e.g., Al Ahly SC, Zamalek SC, etc.")}
                className={`bg-transparent outline-none w-full text-sm ${
                  isDark
                    ? "text-white placeholder-gray-500"
                    : "text-black placeholder-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Previous Clubs */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("Previous Clubs")}
            </label>
            <div
              className={`flex items-start rounded-xl px-4 py-3 border transition-colors ${
                isDark
                  ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
                  : "bg-white border-gray-300 focus-within:border-yellow-400"
              }`}
            >
              <History size={18} className="text-yellow-400 mr-3 mt-1" />
              <textarea
                value={formData.previous_clubs}
                onChange={(e) => handleChange("previous_clubs", e.target.value)}
                placeholder={t(
                  "e.g., Sporting CP, Manchester United, Real Madrid, Juventus",
                )}
                rows={4}
                className={`bg-transparent outline-none w-full text-sm resize-none ${
                  isDark
                    ? "text-white placeholder-gray-500"
                    : "text-black placeholder-gray-400"
                }`}
              />
            </div>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {t("Separate clubs with commas (e.g., Club A, Club B, Club C)")}
            </p>
          </div>

          <div className="flex justify-between mt-10">
            <button
              type="button"
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition ${
                isDark
                  ? "text-gray-400 bg-[#090B6E]/20 border-gray-500/30 hover:bg-[#090B6E]/40"
                  : "text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft size={18} /> {t("Previous")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? t("Saving...") : t("Save")}
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}