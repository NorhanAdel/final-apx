"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  MapPin,
  Plus,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  AlignLeft,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { uploadGraphQL } from "@/app/lib/uploadGraphQL";
import useTranslate from "@/app/hooks/useTranslate";
import { toast } from "sonner";
import { GET_MY_AGENT_PROFILE } from "@/app/graphql/query/agent.queries";
import {
  CREATE_AGENT_PROFILE,
  UPDATE_MY_AGENT_PROFILE_WITH_IMAGE,
} from "@/app/graphql/mutation/agent.mutations";
import { GET_MY_AGENT_LEGAL_STATUS } from "@/app/graphql/query/legal-verification.queries";

interface AgentProfile {
  id: string;
  first_name: string;
  last_name: string;
  bio?: string;
  country?: string;
  city?: string;
  nationality?: string;
  email_address: string;
  phone?: string;
  birth_date?: string;
  profile_image_url?: string;
  is_verified: boolean;
}

export default function AgentPersonalInformation() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, lang } = useTranslate();
  const isDark = theme === "dark";
  const isRTL = lang === "ar";

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [existingProfile, setExistingProfile] = useState<AgentProfile | null>(
    null,
  );

  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [originalFormData, setOriginalFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone: "",
    birth_date: "",
    nationality: "",
    country: "",
    city: "",
    bio: "",
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    phone: "",
    birth_date: "",
    nationality: "",
    country: "",
    city: "",
    bio: "",
  });

  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const formattedDate = `${birthYear}-${birthMonth.padStart(
        2,
        "0",
      )}-${birthDay.padStart(2, "0")}`;
      setFormData((prev) => ({ ...prev, birth_date: formattedDate }));
    }
  }, [birthDay, birthMonth, birthYear]);

  const fetchMyProfile = useCallback(async () => {
    try {
      const result = await uploadGraphQL<{ myAgentProfile: AgentProfile }>(
        GET_MY_AGENT_PROFILE,
      );
      if (result.data?.myAgentProfile) {
        const profile = result.data.myAgentProfile;
        setExistingProfile(profile);
        setIsEditing(true);

        const dob = profile.birth_date ? profile.birth_date.split("T")[0] : "";
        const [year, month, day] = dob.split("-");

        setBirthYear(year || "");
        setBirthMonth(month || "");
        setBirthDay(day || "");

        const newFormData = {
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email_address: profile.email_address || "",
          phone: profile.phone || "",
          birth_date: dob,
          nationality: profile.nationality || "",
          country: profile.country || "",
          city: profile.city || "",
          bio: profile.bio || "",
        };
        setFormData(newFormData);
        setOriginalFormData(newFormData);
        if (profile.profile_image_url) {
          setImagePreview(getFullImageUrl(profile.profile_image_url));
        }
      }

      await uploadGraphQL<{
        myAgentLegalStatus: {
          is_fifa_certified: boolean;
          fifa_license_id?: string;
        };
      }>(GET_MY_AGENT_LEGAL_STATUS);
    } catch (error) {
      console.error("Error fetching agent profile:", error);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    const hasFormChanges =
      JSON.stringify(formData) !== JSON.stringify(originalFormData);
    const hasImageChanges = imageFile !== null;
    return hasFormChanges || hasImageChanges;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges()) {
      router.push("/agent/legal-status");
      return;
    }

    setLoading(true);

    try {
      const profileImageFile: File | null = imageFile;

      const input = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email_address: formData.email_address,
        phone: formData.phone || null,
        birth_date: formData.birth_date || null,
        nationality: formData.nationality || null,
        country: formData.country || null,
        city: formData.city || null,
        bio: formData.bio || null,
      };

      let result;
      if (isEditing && existingProfile) {
        const variables: Record<string, unknown> = { input };
        if (profileImageFile) {
          variables.profile_image = profileImageFile;
        }
        result = await uploadGraphQL(
          UPDATE_MY_AGENT_PROFILE_WITH_IMAGE,
          variables,
        );
      } else {
        const variables: Record<string, unknown> = { input };
        if (profileImageFile) {
          variables.profile_image = profileImageFile;
        }
        result = await uploadGraphQL(CREATE_AGENT_PROFILE, variables);
      }

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else {
        if (hasChanges()) {
          toast.success(
            isEditing
              ? t("Profile updated successfully!")
              : t("Profile created successfully!"),
          );
        }
        await fetchMyProfile();
        router.push("/agent/legal-status");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(t("Failed to save profile"));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h1 className="text-center text-3xl font-bold mb-5 text-yellow-400">
        {t("Agent Profile")}
      </h1>

      <div className="max-w-6xl mx-auto px-6">
        {/* Steps Navigation Icons */}
        <div className="flex justify-center items-center gap-6 mb-10">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
              isDark
                ? "bg-yellow-500/20 border-yellow-500 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105"
                : "bg-yellow-100 border-yellow-400 text-yellow-600 shadow-md scale-105"
            }`}
            title={t("Agent Profile")}
          >
            <User size={30} />
          </div>

          <div
            className={`w-12 h-[2px] ${
              isDark ? "bg-yellow-500/30" : "bg-yellow-400/50"
            }`}
          />

          <button
            type="button"
            onClick={() => router.push("/agent/legal-status")}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105 ${
              isDark
                ? "border-yellow-500/30 bg-yellow-500/10 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-500"
                : "border-yellow-400/50 bg-yellow-100/50 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600"
            }`}
            title={t("Legal Status")}
          >
            <ShieldCheck size={30} />
          </button>
        </div>

        <div className="mb-12">
          <label
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${
              isDark
                ? "border-yellow-500/30 bg-[#0b1736]/40 hover:bg-[#0b1736]/60"
                : "border-yellow-400/50 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {imagePreview ? (
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400"
                    unoptimized
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition z-10"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <div
                  className={`p-5 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${
                    isDark ? "bg-[#1e2d5a]" : "bg-yellow-100"
                  }`}
                >
                  <Plus size={40} className="text-yellow-400" />
                </div>
              )}
              <p
                className={`text-sm font-medium ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {t("Click To Add Profile Photo")}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <InputWithIcon
            label={t("First Name")}
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            icon={<User size={18} />}
            isDark={isDark}
            required
            isRTL={isRTL}
          />
          <InputWithIcon
            label={t("Last Name")}
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            icon={<User size={18} />}
            isDark={isDark}
            required
            isRTL={isRTL}
          />
          <InputWithIcon
            label={t("Email Address")}
            name="email_address"
            value={formData.email_address}
            onChange={handleInputChange}
            icon={<Mail size={18} />}
            isDark={isDark}
            type="email"
            required
            isRTL={isRTL}
          />
          <InputWithIcon
            label={t("Phone Number")}
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            icon={<Phone size={18} />}
            isDark={isDark}
            type="tel"
            isRTL={isRTL}
          />

          {/* Date of Birth - Separated Fields */}
          <div className="space-y-2">
            <label
              className={`block text-sm mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("Birth Date")}
            </label>
            <div className="flex gap-3" dir="ltr">
              <div className="flex-1">
                <div
                  className={`flex items-center rounded-xl px-4 py-3 border transition-colors ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
                      : "bg-white border-gray-300 focus-within:border-yellow-400"
                  }`}
                >
                  <Calendar size={18} className="text-yellow-400 mr-3" />
                  <input
                    type="text"
                    placeholder="DD"
                    value={birthDay}
                    onChange={(e) =>
                      setBirthDay(e.target.value.replace(/\D/g, "").slice(0, 2))
                    }
                    className={`bg-transparent outline-none w-full text-sm ${
                      isDark
                        ? "text-white placeholder-gray-500"
                        : "text-black placeholder-gray-400"
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div
                  className={`flex items-center rounded-xl px-4 py-3 border ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
                      : "bg-white border-gray-300 focus-within:border-yellow-400"
                  }`}
                >
                  <Calendar size={18} className="text-yellow-400 mr-3" />
                  <input
                    type="text"
                    placeholder="MM"
                    value={birthMonth}
                    onChange={(e) =>
                      setBirthMonth(
                        e.target.value.replace(/\D/g, "").slice(0, 2),
                      )
                    }
                    className={`bg-transparent outline-none w-full text-sm ${
                      isDark
                        ? "text-white placeholder-gray-500"
                        : "text-black placeholder-gray-400"
                    }`}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div
                  className={`flex items-center rounded-xl px-4 py-3 border ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
                      : "bg-white border-gray-300 focus-within:border-yellow-400"
                  }`}
                >
                  <Calendar size={18} className="text-yellow-400 mr-3" />
                  <input
                    type="text"
                    placeholder="YYYY"
                    value={birthYear}
                    onChange={(e) =>
                      setBirthYear(
                        e.target.value.replace(/\D/g, "").slice(0, 4),
                      )
                    }
                    className={`bg-transparent outline-none w-full text-sm ${
                      isDark
                        ? "text-white placeholder-gray-500"
                        : "text-black placeholder-gray-400"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <InputWithIcon
            label={t("Nationality")}
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            icon={<Globe size={18} />}
            isDark={isDark}
            isRTL={isRTL}
          />
          <InputWithIcon
            label={t("Country")}
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            icon={<MapPin size={18} />}
            isDark={isDark}
            isRTL={isRTL}
          />
          <InputWithIcon
            label={t("City")}
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            icon={<MapPin size={18} />}
            isDark={isDark}
            isRTL={isRTL}
          />

          <div className="md:col-span-2">
            <TextareaWithIcon
              label={t("Bio / Description")}
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              icon={<AlignLeft size={18} />}
              isDark={isDark}
              rows={4}
              isRTL={isRTL}
            />
          </div>

          <div className="md:col-span-2 flex justify-between mt-10">
            <button
              type="button"
              onClick={() => router.push("/agent")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition ${
                isDark
                  ? "text-gray-400 bg-[#090B6E]/20 border-gray-500/30 hover:bg-[#090B6E]/40"
                  : "text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200"
              }`}
            >
              {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}{" "}
              {t("Back")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isEditing ? (
                t("Update Profile")
              ) : (
                t("Save")
              )}
              {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (field: string, value: string) => void;
  icon: React.ReactNode;
  isDark: boolean;
  type?: string;
  required?: boolean;
  placeholder?: string;
  isRTL?: boolean;
}

function InputWithIcon({
  label,
  name,
  value,
  onChange,
  icon,
  isDark,
  type = "text",
  required = false,
  placeholder,
  isRTL = false,
}: InputProps) {
  const isLTRField = name === "phone" || name === "email_address";

  return (
    <div>
      <label
        className={`block text-sm mb-2 ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
        {required && " *"}
      </label>
      <div
        className={`flex items-center rounded-xl px-4 py-3 border transition-colors ${
          isDark
            ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
            : "bg-white border-gray-300 focus-within:border-yellow-400"
        }`}
        dir={isLTRField ? "ltr" : undefined}
      >
        <span className={`text-yellow-400 ${isRTL ? "ml-3" : "mr-3"}`}>
          {icon}
        </span>
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          type={type}
          placeholder={placeholder || label}
          required={required}
          className={`bg-transparent outline-none w-full text-sm ${
            isLTRField ? (isRTL ? "text-right" : "text-left") : ""
          } ${
            isDark
              ? "text-white placeholder-gray-500"
              : "text-black placeholder-gray-400"
          }`}
          dir={isLTRField ? "ltr" : undefined}
        />
      </div>
    </div>
  );
}

interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (field: string, value: string) => void;
  icon: React.ReactNode;
  isDark: boolean;
  rows?: number;
  placeholder?: string;
  isRTL?: boolean;
}

function TextareaWithIcon({
  label,
  name,
  value,
  onChange,
  icon,
  isDark,
  rows = 4,
  placeholder,
  isRTL = false,
}: TextareaProps) {
  return (
    <div>
      <label
        className={`block text-sm mb-2 ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      <div
        className={`flex items-start rounded-xl px-4 py-3 border transition-colors ${
          isDark
            ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
            : "bg-white border-gray-300 focus-within:border-yellow-400"
        }`}
      >
        <span className={`text-yellow-400 mt-1 ${isRTL ? "ml-3" : "mr-3"}`}>
          {icon}
        </span>
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          rows={rows}
          placeholder={placeholder || label}
          className={`bg-transparent outline-none w-full text-sm resize-none ${
            isDark
              ? "text-white placeholder-gray-500"
              : "text-black placeholder-gray-400"
          }`}
        />
      </div>
    </div>
  );
}
