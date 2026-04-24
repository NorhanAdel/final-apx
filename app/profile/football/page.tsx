// app/profile/football/page.tsx
"use client";

import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import {
  User,
  Users,
  Trophy,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
import { GET_MY_FOOTBALL_INFO } from "@/app/graphql/query/player.queries";
import {
  CREATE_FOOTBALL_INFO,
  UPDATE_FOOTBALL_INFO,
} from "@/app/graphql/mutation/player.mutations";
import { GET_ALL_POSITIONS } from "@/app/graphql/query/sportPositions.queries";

interface Position {
  id: string;
  name: string;
  category?: string;
  sport?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

interface FootballInfoData {
  id: string;
  position: Position | null;
  preferred_foot: string;
  jersey_number: number;
  playing_style: string;
  strengths: string;
  market_value: number;
}

interface FormData {
  id?: string;
  positionId: string;
  preferred_foot: string;
  jersey_number: string;
  playing_style: string;
  strengths: string;
  market_value: string;
}

export default function FootballInformation() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [sportId, setSportId] = useState<string>("");
  const [existingInfo, setExistingInfo] = useState<FootballInfoData | null>(
    null,
  );
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(
    null,
  );

  const [formData, setFormData] = useState<FormData>({
    positionId: "",
    preferred_foot: "RIGHT",
    jersey_number: "",
    playing_style: "",
    strengths: "",
    market_value: "",
  });

  const fetchPositions = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ sportPositions: Position[] }>(
        GET_ALL_POSITIONS,
      );
      if (result.data?.sportPositions) {
        setPositions(result.data.sportPositions);
        if (result.data.sportPositions[0]?.sport?.id) {
          setSportId(result.data.sportPositions[0].sport.id);
        }
      }
    } catch (err) {
      console.error("Error fetching positions:", err);
    }
  }, []);

  const fetchFootballInfo = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ myFootballInfo: FootballInfoData }>(
        GET_MY_FOOTBALL_INFO,
      );
      if (result.data?.myFootballInfo) {
        const info = result.data.myFootballInfo;
        setExistingInfo(info);
        const loaded = {
          id: info.id,
          positionId: info.position?.id || "",
          preferred_foot: info.preferred_foot || "RIGHT",
          jersey_number: info.jersey_number?.toString() || "",
          playing_style: info.playing_style || "",
          strengths: info.strengths || "",
          market_value: info.market_value?.toString() || "",
        };
        setFormData(loaded);
        setOriginalFormData(loaded);
      }
    } catch (err) {
      console.error("Error fetching football info:", err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchPositions(), fetchFootballInfo()]).finally(() => {
      setPageLoading(false);
    });
  }, [fetchPositions, fetchFootballInfo, lang]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormUnchanged = useCallback(() => {
    if (!originalFormData) return false;
    return (
      formData.positionId === originalFormData.positionId &&
      formData.preferred_foot === originalFormData.preferred_foot &&
      formData.jersey_number === originalFormData.jersey_number &&
      formData.playing_style === originalFormData.playing_style &&
      formData.strengths === originalFormData.strengths &&
      formData.market_value === originalFormData.market_value
    );
  }, [formData, originalFormData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (existingInfo && isFormUnchanged()) {
      router.push("/profile/clubcareer");
      return;
    }

    setLoading(true);

    if (!sportId) {
      toast.error("Sport not found");
      setLoading(false);
      return;
    }

    if (!formData.positionId) {
      toast.error("Please select a position");
      setLoading(false);
      return;
    }

    const isUpdate = !!existingInfo?.id;
    const mutation = isUpdate ? UPDATE_FOOTBALL_INFO : CREATE_FOOTBALL_INFO;

    const input = {
      sport_id: sportId,
      position_id: formData.positionId,
      preferred_foot: formData.preferred_foot,
      jersey_number: parseInt(formData.jersey_number) || 0,
      playing_style: formData.playing_style,
      strengths: formData.strengths,
      market_value: parseFloat(formData.market_value) || 0,
    };

    let variables;
    if (isUpdate) {
      variables = {
        id: existingInfo.id,
        input: input,
      };
    } else {
      variables = { input };
    }

    try {
      const result = await fetchGraphQL(mutation, variables);
      if (result.errors) {
        toast.error(result.errors[0].message);
      } else {
        toast.success(t("Saving..."));
        router.push("/profile/clubcareer");
      }
    } catch {
      toast.error("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-30 flex items-center justify-center transition
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-50 text-black"}`}
    >
      <div className="w-full max-w-6xl px-6">
        <h1
          className={`text-center text-3xl font-bold mb-10
          ${isDark ? "text-yellow-400" : "text-[#F0B100]"}`}
        >
          {t("Football Information")}
        </h1>

        <div className="flex justify-center items-center gap-6 mb-10">
          <Step icon={<User />} active isDark={isDark} />
          <Line isDark={isDark} />
          <Step icon={<Trophy />} isDark={isDark} />
          <Line isDark={isDark} />
          <Step icon={<Users />} isDark={isDark} />
          <Line isDark={isDark} />
          <Step icon={<ImageIcon />} isDark={isDark} />
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <Select
            label={t("Position")}
            name="positionId"
            value={formData.positionId}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
            options={positions.map((p) => ({ label: p.name, value: p.id }))}
          />

          <Select
            label={t("Preferred Foot")}
            name="preferred_foot"
            value={formData.preferred_foot}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
            options={[
              { label: t("Right"), value: "RIGHT" },
              { label: t("Left"), value: "LEFT" },
              { label: t("Both"), value: "BOTH" },
            ]}
          />

          <Input
            label={t("Jersey Number")}
            name="jersey_number"
            type="number"
            value={formData.jersey_number}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
          />

          <Input
            label={t("Playing Style")}
            name="playing_style"
            value={formData.playing_style}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
          />

          <Input
            label={t("Strengths")}
            name="strengths"
            value={formData.strengths}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
          />

          <Input
            label={t("Market Value")}
            name="market_value"
            type="number"
            value={formData.market_value}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
          />

          <div className="md:col-span-2 flex justify-between mt-10">
            <button
              type="button"
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition ${
                isDark
                  ? "text-gray-400 bg-[#090B6E]/20 border-gray-500/30 hover:bg-[#090B6E]/40"
                  : "text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft size={18} /> {t("Back")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? t("Saving...") : t("Next")}
              <ChevronRight size={18} />
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

function Input({
  label,
  icon,
  type = "text",
  name,
  value,
  onChange,
  isDark,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDark: boolean;
}) {
  return (
    <div>
      <label
        className={`block mb-2 text-sm ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div
        className={`flex items-center rounded-xl px-4 py-3 border transition-colors ${
          isDark
            ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
            : "bg-white border-gray-300 focus-within:border-yellow-400"
        }`}
      >
        <span className="text-yellow-400 mr-3">{icon}</span>
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={label}
          className={`bg-transparent outline-none w-full text-sm ${
            isDark
              ? "text-white placeholder-gray-500"
              : "text-black placeholder-gray-400"
          }`}
        />
      </div>
    </div>
  );
}

function Select({
  label,
  icon,
  name,
  value,
  onChange,
  options,
  isDark,
}: {
  label: string;
  icon: React.ReactNode;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  isDark: boolean;
}) {
  return (
    <div>
      <label
        className={`block mb-2 text-sm ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div
        className={`flex items-center rounded-xl px-4 py-3 border transition-colors ${
          isDark
            ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
            : "bg-white border-gray-300 focus-within:border-yellow-400"
        }`}
      >
        <span className="text-yellow-400 mr-3">{icon}</span>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`bg-transparent outline-none w-full text-sm cursor-pointer appearance-none ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className={isDark ? "bg-[#0b1736]" : "bg-white"}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
