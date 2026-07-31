"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import {
  User,
  Trophy,
  Briefcase,
  ShieldCheck,
  Camera,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "sonner";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
import { UPDATE_PLAYER_CLUB_CAREER } from "@/app/graphql/mutation/player.mutations";
import {
  GET_MY_CLUB_CAREER,
  GET_PROFESSIONAL_DEBUT_OPTIONS,
} from "@/app/graphql/query/player.queries";

interface ClubCareerFormData {
  current_club: string;
  professional_debut: string;
  previous_clubs: string;
}

interface ProfessionalDebutOption {
  value: string;
  label: string;
}

export default function ClubCareer() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [initialData, setInitialData] = useState<ClubCareerFormData | null>(
    null,
  );
  const [formData, setFormData] = useState<ClubCareerFormData>({
    current_club: "",
    professional_debut: "",
    previous_clubs: "",
  });
  const [professionalDebutOptions, setProfessionalDebutOptions] = useState<
    ProfessionalDebutOption[]
  >([]);

  const fetchProfessionalDebutOptions = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{
        getProfessionalDebutOptions: ProfessionalDebutOption[];
      }>(GET_PROFESSIONAL_DEBUT_OPTIONS, { lang });

      if (result.data?.getProfessionalDebutOptions) {
        setProfessionalDebutOptions(result.data.getProfessionalDebutOptions);
      }
    } catch (err) {
      console.error("Failed to fetch professional debut options:", err);
    }
  }, [lang]);

  const fetchCareerData = useCallback(async () => {
    setFetching(true);
    try {
      const result = await fetchGraphQL<{ myClubCareer: ClubCareerFormData }>(
        GET_MY_CLUB_CAREER,
      );

      if (result.data?.myClubCareer) {
        const career = result.data.myClubCareer;
        const data = {
          current_club: career.current_club || "",
          professional_debut: career.professional_debut || "",
          previous_clubs: career.previous_clubs || "",
        };
        setFormData(data);
        setInitialData(data);
      }
    } catch (err) {
      console.error("Failed to load career data", err);
      toast.error(t("Failed to load data"));
    } finally {
      setFetching(false);
    }
  }, [t]);

  useEffect(() => {
    Promise.all([fetchCareerData(), fetchProfessionalDebutOptions()]);
  }, [lang, fetchCareerData, fetchProfessionalDebutOptions]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isNewData = initialData === null;
    const hasChanged =
      !isNewData &&
      (formData.current_club !== initialData?.current_club ||
        formData.professional_debut !== initialData?.professional_debut ||
        formData.previous_clubs !== initialData?.previous_clubs);

    const isFormEmpty =
      !formData.current_club &&
      !formData.professional_debut &&
      !formData.previous_clubs;

    if (isFormEmpty) {
      router.push("/profile/legal-status");
      return;
    }

    if (!isNewData && !hasChanged) {
      router.push("/profile/legal-status");
      return;
    }

    setLoading(true);

    try {
      const result = await fetchGraphQL(UPDATE_PLAYER_CLUB_CAREER, {
        input: formData,
      });

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else {
        await fetchCareerData();
        toast.success(t("Saved successfully"));
        router.push("/profile/legal-status");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(t("Network error"));
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  if (fetching) {
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
          {t("Club Career")}
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
            active
            icon={<Briefcase size={22} />}
            isDark={isDark}
            onClick={() => router.push("/profile/clubcareer")}
          />
          <Line isDark={isDark} />
          <Step
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

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <Input
            label={t("Current Club")}
            name="current_club"
            value={formData.current_club}
            onChange={handleChange}
            placeholder={t("e.g. Al Nassr FC")}
            isDark={isDark}
          />

          <div>
            <label
              className={`text-sm block mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("Years of Experience")}
            </label>
            <select
              name="professional_debut"
              value={formData.professional_debut}
              onChange={handleChange}
              className={`w-full rounded-xl px-4 py-3 outline-none transition appearance-none ${
                isDark
                  ? "bg-[#0b1736] border border-[#1e2d5a] focus:border-yellow-400 text-white placeholder-gray-500"
                  : "bg-white border border-gray-300 focus:border-yellow-400 text-black placeholder-gray-400"
              }`}
            >
              <option value="">{t("Select years of experience")}</option>
              {professionalDebutOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              className={`text-sm block mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("Previous Clubs")}
            </label>
            <textarea
              name="previous_clubs"
              value={formData.previous_clubs}
              onChange={handleChange}
              placeholder={t(
                "e.g. Sporting CP, Manchester United, Real Madrid",
              )}
              className={`w-full h-36 rounded-xl p-4 outline-none transition resize-none ${
                isDark
                  ? "bg-[#0b1736] border border-[#1e2d5a] focus:border-yellow-400 text-white placeholder-gray-500"
                  : "bg-white border border-gray-300 focus:border-yellow-400 text-black placeholder-gray-400"
              }`}
            />
          </div>

          <div className="md:col-span-2 flex justify-between mt-12">
            <button
              type="button"
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg transition ${
                isDark
                  ? "bg-[#081f55] border-x border-yellow-400 hover:bg-[#0b2b6b] text-white"
                  : "bg-gray-200 border-x border-yellow-400 hover:bg-gray-300 text-black"
              }`}
            >
              <ChevronLeft size={20} /> {t("Previous")}
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
              <ChevronRight size={20} />
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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isDark: boolean;
}

function Input({ label, isDark, ...props }: InputProps) {
  return (
    <div>
      <label
        className={`text-sm block mb-2 ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <input
        {...props}
        className={`w-full rounded-xl px-4 py-3 outline-none transition ${
          isDark
            ? "bg-[#0b1736] border border-[#1e2d5a] focus:border-yellow-400 text-white placeholder-gray-500"
            : "bg-white border border-gray-300 focus:border-yellow-400 text-black placeholder-gray-400"
        }`}
      />
    </div>
  );
}