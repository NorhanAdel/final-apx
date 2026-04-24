// app/agent/profile/page.tsx

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
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import { uploadGraphQL } from "../../lib/uploadGraphQL";
import useTranslate from "../../hooks/useTranslate";
import { toast } from "sonner";
import { GET_MY_AGENT_PROFILE } from "@/app/graphql/query/agent.queries";
import {
  CREATE_AGENT_PROFILE,
  UPDATE_MY_AGENT_PROFILE_WITH_IMAGE,
} from "@/app/graphql/mutation/agent.mutations";

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
  const { t } = useTranslate();
  const isDark = theme === "dark";

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [existingProfile, setExistingProfile] = useState<AgentProfile | null>(
    null,
  );
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

  const fetchMyProfile = useCallback(async () => {
    try {
      const result = await uploadGraphQL<{ myAgentProfile: AgentProfile }>(
        GET_MY_AGENT_PROFILE,
      );
      if (result.data?.myAgentProfile) {
        const profile = result.data.myAgentProfile;
        setExistingProfile(profile);
        setIsEditing(true);
        const newFormData = {
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email_address: profile.email_address || "",
          phone: profile.phone || "",
          birth_date: profile.birth_date
            ? profile.birth_date.split("T")[0]
            : "",
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges() && !fileInputRef.current?.files?.[0]) {
      router.push("/agent");
      return;
    }

    setLoading(true);

    try {
      let profileImageFile: File | null = null;
      if (fileInputRef.current?.files?.[0]) {
        profileImageFile = fileInputRef.current.files[0];
      }

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
        if (hasChanges() || profileImageFile) {
          toast.success(
            isEditing
              ? t("Profile updated successfully!")
              : t("Profile created successfully!"),
          );
        }
        await fetchMyProfile();
        router.push("/agent");
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
      className={`min-h-screen py-20 flex items-center justify-center relative overflow-hidden transition
        ${isDark ? "bg-[#020617] text-white" : "bg-[#f9fafb] text-black"}`}
    >
      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')] bg-center bg-cover"></div>

      <div className="relative w-full max-w-5xl px-6 py-10">
        <h1
          className={`text-center text-3xl font-black italic mb-2 uppercase tracking-wider
            ${isDark ? "text-yellow-400" : "text-yellow-600"}`}
        >
          {t("Agent Personal Information")}
        </h1>

        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center border-2
            ${
              isDark
                ? "bg-yellow-500/20 border-yellow-500"
                : "bg-yellow-200/20 border-yellow-400"
            }`}
          >
            <User
              className={`${isDark ? "text-yellow-500" : "text-yellow-600"}`}
              size={32}
            />
          </div>
        </div>

        {existingProfile && (
          <div className={`flex justify-center mb-6`}>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm
              ${
                existingProfile.is_verified
                  ? "bg-green-500/20 text-green-500"
                  : "bg-yellow-500/20 text-yellow-500"
              }`}
            >
              {existingProfile.is_verified ? (
                <>
                  <CheckCircle size={16} />
                  <span>{t("Verified Agent")}</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>{t("Pending Verification")}</span>
                </>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-10 flex justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-2xl aspect-[3/1] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition-all group
                ${
                  isDark
                    ? "bg-[#050b1d]/50 border-yellow-600/30 hover:border-yellow-500/50"
                    : "bg-white border-gray-300 shadow hover:border-gray-400/50"
                }`}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={800}
                    height={267}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold italic">
                      {t("Change Photo")}
                    </p>
                  </div>
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div
                  className={`flex flex-col items-center ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Plus size={32} className="mb-2" />
                  <span className="text-sm italic font-medium text-center">
                    {t("Click To Add Profile Photo")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
            <InputWithIcon
              label={t("First Name")}
              icon={<User size={18} />}
              placeholder={t("First Name")}
              theme={theme}
              value={formData.first_name}
              onChange={(val) => handleInputChange("first_name", val)}
              required
            />
            <InputWithIcon
              label={t("Last Name")}
              icon={<User size={18} />}
              placeholder={t("Last Name")}
              theme={theme}
              value={formData.last_name}
              onChange={(val) => handleInputChange("last_name", val)}
              required
            />
            <InputWithIcon
              label={t("Email Address")}
              icon={<Mail size={18} />}
              placeholder={t("Email")}
              theme={theme}
              value={formData.email_address}
              onChange={(val) => handleInputChange("email_address", val)}
              type="email"
              required
            />
            <InputWithIcon
              label={t("Phone Number")}
              icon={<Phone size={18} />}
              placeholder={t("Phone Number")}
              theme={theme}
              value={formData.phone}
              onChange={(val) => handleInputChange("phone", val)}
              type="tel"
            />
            <InputWithIcon
              label={t("Date of Birth")}
              icon={<Calendar size={18} />}
              placeholder={t("Date")}
              theme={theme}
              value={formData.birth_date}
              onChange={(val) => handleInputChange("birth_date", val)}
              type="date"
            />
            <InputWithIcon
              label={t("Nationality")}
              icon={<Globe size={18} />}
              placeholder={t("Nationality")}
              theme={theme}
              value={formData.nationality}
              onChange={(val) => handleInputChange("nationality", val)}
            />
            <InputWithIcon
              label={t("Country")}
              icon={<MapPin size={18} />}
              placeholder={t("Country")}
              theme={theme}
              value={formData.country}
              onChange={(val) => handleInputChange("country", val)}
            />
            <InputWithIcon
              label={t("City")}
              icon={<MapPin size={18} />}
              placeholder={t("City")}
              theme={theme}
              value={formData.city}
              onChange={(val) => handleInputChange("city", val)}
            />

            <div className="md:col-span-2 mt-2">
              <label
                className={`text-sm font-bold block mb-2 italic ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {t("Bio / Description")}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder={t("Tell us about yourself as an agent...")}
                rows={4}
                className={`w-full rounded-xl p-4 outline-none resize-none border transition
                  ${
                    isDark
                      ? "bg-[#050b1d] border-[#1e2d5a] text-white focus:border-yellow-500/50"
                      : "bg-white border-gray-300 text-black shadow-sm focus:border-yellow-500"
                  }`}
              />
            </div>
          </div>

          <div className="flex justify-between mt-12">
            <button
              type="button"
              onClick={() => router.push("/agent")}
              className={`flex items-center gap-2 px-10 py-3 rounded-md transition
                ${
                  isDark
                    ? "bg-[#050b1d] border text-gray-400"
                    : "bg-gray-100 border text-gray-600"
                }`}
            >
              <ChevronLeft size={20} />
              {t("Back")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-12 py-3 rounded-md transition
                ${loading ? "opacity-50 cursor-not-allowed" : ""}
                ${
                  isDark
                    ? "bg-[#081f55] border-x-2 border-yellow-500 text-white"
                    : "bg-yellow-500 text-black"
                }`}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {loading
                ? t("Saving...")
                : isEditing
                ? t("Update Profile")
                : t("Save")}
              <ChevronRight
                size={20}
                className={`${isDark ? "text-yellow-500" : "text-black"}`}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputWithIcon({
  label,
  icon,
  placeholder,
  theme,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  theme: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const isDark = theme === "dark";

  return (
    <div className="space-y-2">
      <label
        className={`text-sm font-bold italic ${
          isDark ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {label}
        {required && "*"}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-yellow-500">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl px-12 py-3 border transition
            ${
              isDark
                ? "bg-[#0b1736]/60 border-gray-600 text-white"
                : "bg-white border-gray-300 text-black shadow-sm"
            }`}
        />
      </div>
    </div>
  );
}
