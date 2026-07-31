"use client";

import {
  useState,
  useEffect,
  useRef,
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
  ShieldCheck,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Footprints,
  Hash,
  Swords,
  Zap,
  DollarSign,
  MapPin,
  Search,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "../../hooks/useTranslate";
import {
  GET_MY_FOOTBALL_INFO,
  GET_SKILL_LEVEL_OPTIONS,
  GET_GOAL_OPTIONS,
} from "@/app/graphql/query/player.queries";
import {
  CREATE_FOOTBALL_INFO,
  UPDATE_FOOTBALL_INFO,
} from "@/app/graphql/mutation/player.mutations";
import { GET_ALL_SPORTS } from "@/app/graphql/query/sports.queries";

interface Sport {
  id: string;
  name: string;
  image_url?: string;
  created_at?: string;
}

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

interface OptionItem {
  value: string;
  label: string;
}

interface FootballInfoData {
  id: string;
  sport_id?: string;
  position_id?: string;
  sport?: { id: string; name: string } | null;
  position: (Position & { sport_id?: string }) | null;
  preferred_foot: string;
  jersey_number: number;
  playing_style: string;
  strengths: string[];
  market_value: number;
}

interface FormData {
  id?: string;
  selectedSportId: string;
  positionId: string;
  preferred_foot: string;
  jersey_number: string;
  skill_level: string;
  professional_goals: string[];
  market_value: string;
}

export default function FootballInformation() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [sports, setSports] = useState<Sport[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [skillLevelOptions, setSkillLevelOptions] = useState<OptionItem[]>([]);
  const [goalOptions, setGoalOptions] = useState<OptionItem[]>([]);
  const [existingInfo, setExistingInfo] = useState<FootballInfoData | null>(
    null,
  );
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(
    null,
  );

  const [formData, setFormData] = useState<FormData>({
    selectedSportId: "",
    positionId: "",
    preferred_foot: "RIGHT",
    jersey_number: "",
    skill_level: "",
    professional_goals: [],
    market_value: "",
  });

  const [isRestoringExisting, setIsRestoringExisting] = useState(false);

  const fetchSports = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ sports: Sport[] }>(GET_ALL_SPORTS);
      if (result.data?.sports) {
        setSports(result.data.sports);
      }
    } catch (err) {
      console.error("Error fetching sports:", err);
    }
  }, []);

  const fetchSkillLevelOptions = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{
        getSkillLevelOptions: OptionItem[];
      }>(GET_SKILL_LEVEL_OPTIONS, { lang });
      if (result.data?.getSkillLevelOptions) {
        setSkillLevelOptions(result.data.getSkillLevelOptions);
      }
    } catch (err) {
      console.error("Error fetching skill level options:", err);
    }
  }, [lang]);

  const fetchGoalOptions = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ getGoalOptions: OptionItem[] }>(
        GET_GOAL_OPTIONS,
        { lang },
      );
      if (result.data?.getGoalOptions) {
        setGoalOptions(result.data.getGoalOptions);
      }
    } catch (err) {
      console.error("Error fetching goal options:", err);
    }
  }, [lang]);

  const normalizeFoot = (foot?: string | null): string => {
    if (!foot) return "RIGHT";
    const trimmed = foot.trim();
    const upper = trimmed.toUpperCase();
    if (
      upper.includes("LEFT") ||
      trimmed.includes("يسر") ||
      trimmed === "يسرى" ||
      trimmed === "Esquerda"
    ) {
      return "LEFT";
    }
    if (
      upper.includes("BOTH") ||
      trimmed.includes("كلتا") ||
      trimmed.includes("قدمين") ||
      trimmed === "كلتاهما" ||
      trimmed === "كلا القدمين" ||
      trimmed === "Ambas"
    ) {
      return "BOTH";
    }
    return "RIGHT";
  };

  const fetchFootballInfo = useCallback(async () => {
    try {
      const result = await fetchGraphQL<{ myFootballInfo: FootballInfoData }>(
        GET_MY_FOOTBALL_INFO,
      );
      if (result.data?.myFootballInfo) {
        const info = result.data.myFootballInfo;
        setExistingInfo(info);

        const existingSportId =
          info.sport_id ||
          info.sport?.id ||
          info.position?.sport_id ||
          info.position?.sport?.id ||
          "";

        const loaded: FormData = {
          id: info.id,
          selectedSportId: existingSportId,
          positionId: info.position_id || info.position?.id || "",
          preferred_foot: normalizeFoot(info.preferred_foot),
          jersey_number: info.jersey_number?.toString() || "",
          skill_level: info.playing_style || "",
          professional_goals: info.strengths || [],
          market_value: info.market_value?.toString() || "",
        };
        setIsRestoringExisting(true);
        setFormData(loaded);
        setOriginalFormData(loaded);
      }
    } catch (err) {
      console.error("Error fetching football info:", err);
    }
  }, []);

  useEffect(() => {
    Promise.all([
      fetchSports(),
      fetchFootballInfo(),
      fetchSkillLevelOptions(),
      fetchGoalOptions(),
    ]).finally(() => {
      setPageLoading(false);
    });
  }, [fetchSports, fetchFootballInfo, fetchSkillLevelOptions, fetchGoalOptions, lang]);

  useEffect(() => {
    if (!formData.selectedSportId) {
      setPositions([]);
      return;
    }

    const fetchPositions = async () => {
      setPositionsLoading(true);
      try {
        const query = `
          query GetPositionsBySport($sportId: ID!) {
            positionsBySport(sportId: $sportId) {
              id
              name
              category
              image_url
              sport {
                id
                name
                image_url
              }
            }
          }
        `;
        const result = await fetchGraphQL<{ positionsBySport: Position[] }>(
          query,
          { sportId: formData.selectedSportId },
        );
        if (result.data?.positionsBySport) {
          setPositions(result.data.positionsBySport);
        } else {
          setPositions([]);
        }
      } catch (err) {
        console.error("Error fetching positions:", err);
        setPositions([]);
      } finally {
        setPositionsLoading(false);
        if (isRestoringExisting) {
          setIsRestoringExisting(false);
        }
      }
    };

    fetchPositions();
  }, [formData.selectedSportId, lang, isRestoringExisting]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "selectedSportId" && value !== formData.selectedSportId) {
      setFormData((prev) => ({
        ...prev,
        selectedSportId: value,
        positionId: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormUnchanged = useCallback(() => {
    if (!originalFormData) return false;
    return (
      formData.selectedSportId === originalFormData.selectedSportId &&
      formData.positionId === originalFormData.positionId &&
      formData.preferred_foot === originalFormData.preferred_foot &&
      formData.jersey_number === originalFormData.jersey_number &&
      formData.skill_level === originalFormData.skill_level &&
      formData.professional_goals.length === originalFormData.professional_goals.length &&
      formData.professional_goals.every((v) => originalFormData.professional_goals.includes(v)) &&
      formData.market_value === originalFormData.market_value
    );
  }, [formData, originalFormData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (existingInfo && isFormUnchanged()) {
      router.push("/profile/clubcareer");
      return;
    }

    if (!formData.selectedSportId) {
      toast.error(t("Please select a sport"));
      return;
    }

    if (!formData.positionId) {
      toast.error(t("Please select a position"));
      return;
    }

    setLoading(true);

    const isUpdate = !!existingInfo?.id;
    const mutation = isUpdate ? UPDATE_FOOTBALL_INFO : CREATE_FOOTBALL_INFO;

    const input = {
      sport_id: formData.selectedSportId,
      position_id: formData.positionId,
      preferred_foot: formData.preferred_foot,
      jersey_number: parseInt(formData.jersey_number) || 0,
      playing_style: formData.skill_level || undefined,
      strengths: formData.professional_goals,
      market_value: parseFloat(formData.market_value) || 0,
    };

    const variables = { input };

    try {
      const result = await fetchGraphQL(mutation, variables);
      if (result.errors) {
        toast.error(result.errors[0].message);
      } else {
        toast.success(t("Football info saved successfully!"));
        router.push("/profile/clubcareer");
      }
    } catch {
      toast.error(t("Error saving data"));
    } finally {
      setLoading(false);
    }
  };

  const selectedSport = sports.find((s) => s.id === formData.selectedSportId);
  const pageTitle = selectedSport
    ? `${selectedSport.name} ${t("Information")}`
    : t("Sport Information");

  const isDark = theme === "dark";

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-yellow-400">{t("Loading...")}</div>
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
          {pageTitle}
        </h1>

        <div className="flex justify-center items-center gap-6 mb-10">
          <Step icon={<User />} isDark={isDark} onClick={() => router.push('/profile')} />
          <Line isDark={isDark} />
          <Step icon={<Trophy />} active isDark={isDark} onClick={() => router.push('/profile/football')} />
          <Line isDark={isDark} />
          <Step icon={<Users />} isDark={isDark} onClick={() => router.push('/profile/clubcareer')} />
          <Line isDark={isDark} />
          <Step icon={<ShieldCheck />} isDark={isDark} onClick={() => router.push('/profile/legal-status')} />
          <Line isDark={isDark} />
          <Step icon={<ImageIcon />} isDark={isDark} onClick={() => router.push('/profile/imagesreels')} />
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <Select
            label={t("Sport")}
            name="selectedSportId"
            value={formData.selectedSportId}
            onChange={handleChange}
            icon={<Trophy size={18} />}
            isDark={isDark}
            options={sports.map((s) => ({ label: s.name, value: s.id }))}
            placeholder={t("Select a sport")}
            searchPlaceholder={t("Search sports...")}
            noOptionsText={t("No sports found")}
            t={t}
          />

          <Select
            label={t("Position")}
            name="positionId"
            value={formData.positionId}
            onChange={handleChange}
            icon={<MapPin size={18} />}
            isDark={isDark}
            options={positions.map((p) => ({ label: p.name, value: p.id }))}
            disabled={!formData.selectedSportId || positionsLoading}
            isLoading={positionsLoading}
            placeholder={
              positionsLoading
                ? t("Loading positions...")
                : !formData.selectedSportId
                ? t("Select a sport first")
                : t("Select a position")
            }
            searchPlaceholder={t("Search positions...")}
            noOptionsText={t("No positions found")}
            t={t}
          />

          <Select
            label={t("Preferred Foot")}
            name="preferred_foot"
            value={formData.preferred_foot}
            onChange={handleChange}
            icon={<Footprints size={18} />}
            isDark={isDark}
            options={[
              { label: t("Right"), value: "RIGHT" },
              { label: t("Left"), value: "LEFT" },
              { label: t("Both"), value: "BOTH" },
            ]}
            placeholder={t("Select preferred foot")}
            searchPlaceholder={t("Search foot...")}
            noOptionsText={t("No options found")}
            t={t}
          />

          <Input
            label={t("Jersey Number")}
            name="jersey_number"
            type="number"
            value={formData.jersey_number}
            onChange={handleChange}
            icon={<Hash size={18} />}
            isDark={isDark}
            placeholder={t("Enter jersey number")}
          />

          <Select
            label={t("Skill Level")}
            name="skill_level"
            value={formData.skill_level}
            onChange={handleChange}
            icon={<Swords size={18} />}
            isDark={isDark}
            options={skillLevelOptions.map((o) => ({
              label: o.label,
              value: o.value,
            }))}
            placeholder={t("Select your skill level")}
            searchPlaceholder={t("Search...")}
            noOptionsText={t("No options found")}
            t={t}
          />

          <Input
            label={t("Market Value")}
            name="market_value"
            type="number"
            value={formData.market_value}
            onChange={handleChange}
            icon={<DollarSign size={18} />}
            isDark={isDark}
            placeholder={t("Enter market value")}
          />

          <div>
            <Select
              label={t("Professional Goals")}
              name="professional_goals"
              value={formData.professional_goals.join(",")}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setFormData((prev) => ({ ...prev, professional_goals: [] }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    professional_goals: value.split(",").filter(Boolean),
                  }));
                }
              }}
              icon={<Zap size={18} />}
              isDark={isDark}
              options={goalOptions.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              placeholder={t("Select professional goals")}
              searchPlaceholder={t("Search goals...")}
              noOptionsText={t("No options found")}
              t={t}
            />
          </div>

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
      className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer hover:scale-110 ${
        active
          ? "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]"
          : isDark
          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
          : "bg-gray-200 text-gray-500 hover:bg-gray-300"
      }`}
    >
      {icon}
    </button>
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
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDark: boolean;
  placeholder?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="group">
      <label
        className={`block mb-2.5 text-sm font-medium tracking-wide transition-colors duration-200 ${
          isFocused
            ? "text-yellow-400"
            : isDark
            ? "text-gray-400"
            : "text-gray-600"
        }`}
      >
        {label}
      </label>
      <div
        className={`relative flex items-center rounded-xl px-4 py-3.5 border transition-all duration-300 ${
          isDark
            ? `bg-[#0b1736]/80 backdrop-blur-sm ${
                isFocused
                  ? "border-yellow-400/70 shadow-[0_0_15px_rgba(250,204,21,0.08)]"
                  : "border-[#1e2d5a]/80 hover:border-[#2a3f6e]"
              }`
            : `bg-white ${
                isFocused
                  ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.12)]"
                  : "border-gray-200 hover:border-gray-300"
              }`
        }`}
      >
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-300 ${
            isFocused
              ? "bg-yellow-400/20 text-yellow-400"
              : isDark
              ? "bg-yellow-400/10 text-yellow-400/70"
              : "bg-yellow-50 text-yellow-500/70"
          }`}
        >
          {icon}
        </div>
        <input
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          type={type}
          placeholder={placeholder || label}
          className={`bg-transparent outline-none w-full text-sm font-medium ${
            isDark
              ? "text-white placeholder-gray-500/70"
              : "text-gray-900 placeholder-gray-400"
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
  disabled,
  placeholder,
  isLoading,
  searchPlaceholder = "Search...",
  noOptionsText = "No options found",
}: {
  label: string;
  icon: React.ReactNode;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  isDark: boolean;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  noOptionsText?: string;
  t: (key: string) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const showSearch = options.length > 5;

  const handleSelect = (optValue: string) => {
    const syntheticEvent = {
      target: { name, value: optValue },
    } as ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="group relative" ref={containerRef}>
      <label
        className={`block mb-2.5 text-sm font-medium tracking-wide transition-colors duration-200 ${
          isOpen
            ? "text-yellow-400"
            : isDark
            ? "text-gray-400"
            : "text-gray-600"
        }`}
      >
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`relative w-full flex items-center rounded-xl px-4 py-3.5 border transition-all duration-300 text-left ${
          isDark
            ? `bg-[#0b1736]/80 backdrop-blur-sm ${
                isOpen
                  ? "border-yellow-400/70 shadow-[0_0_15px_rgba(250,204,21,0.08)]"
                  : "border-[#1e2d5a]/80 hover:border-[#2a3f6e]"
              }`
            : `bg-white ${
                isOpen
                  ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.12)]"
                  : "border-gray-200 hover:border-gray-300"
              }`
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-300 shrink-0 ${
            isOpen
              ? "bg-yellow-400/20 text-yellow-400"
              : isDark
              ? "bg-yellow-400/10 text-yellow-400/70"
              : "bg-yellow-50 text-yellow-500/70"
          }`}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            icon
          )}
        </div>

        <span
          className={`flex-1 text-sm font-medium truncate ${
            value && selectedLabel
              ? isDark
                ? "text-white"
                : "text-gray-900"
              : isDark
              ? "text-gray-500/70"
              : "text-gray-400"
          }`}
        >
          {value && selectedLabel
            ? selectedLabel
            : placeholder || `Select ${label}`}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          } ${isDark ? "text-gray-500" : "text-gray-400"}`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-xl border overflow-hidden transition-all duration-200 ${
            isDark
              ? "bg-[#0b1736] border-[#1e2d5a] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              : "bg-white border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          }`}
          style={{ animation: "dropdownFadeIn 0.2s ease-out" }}
        >
          {showSearch && (
            <div
              className={`flex items-center gap-2 px-4 py-3 border-b ${
                isDark ? "border-[#1e2d5a]/50" : "border-gray-100"
              }`}
            >
              <Search
                size={14}
                className={isDark ? "text-gray-500" : "text-gray-400"}
              />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={`bg-transparent outline-none w-full text-sm ${
                  isDark
                    ? "text-white placeholder-gray-500"
                    : "text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          )}

          <div className="max-h-52 overflow-y-auto custom-scrollbar py-1">
            {filteredOptions.length === 0 ? (
              <div
                className={`px-4 py-3 text-sm text-center ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {noOptionsText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors duration-150 ${
                      isSelected
                        ? isDark
                          ? "bg-yellow-400/10 text-yellow-400"
                          : "bg-yellow-50 text-yellow-700"
                        : isDark
                        ? "text-gray-300 hover:bg-white/5"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 font-medium">{opt.label}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        className="text-yellow-400 shrink-0"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"};
        }
      `}</style>
    </div>
  );
}