"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Plus,
  AlignLeft,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import Image from "next/image";
import { useTheme } from "@/app/context/ThemeContext";
import useTranslate from "@/app/hooks/useTranslate";
import { uploadGraphQL } from "@/app/lib/uploadGraphQL";
import { MY_SCOUT_PROFILE } from "@/app/graphql/query/scout.queries";
import {
  CREATE_SCOUT_PROFILE,
  UPDATE_SCOUT_PROFILE,
} from "@/app/graphql/mutation/Scout.mutations";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface ScoutFormData {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone: string;
  birth_date: string;
  nationality: string;
  country: string;
  city: string;
  bio: string;
}

interface CreateScoutProfileResponse {
  createScoutProfile: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    phone: string;
    nationality: string;
    country: string;
    city: string;
    birth_date: string;
    bio?: string;
    profile_image_url: string;
    is_verified: boolean;
  };
}

interface UpdateScoutProfileResponse {
  updateMyScoutProfile: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    phone: string;
    nationality: string;
    country: string;
    city: string;
    birth_date: string;
    bio?: string;
    profile_image_url: string;
  };
}

interface MyScoutProfileResponse {
  myScoutProfile: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    phone: string;
    nationality: string;
    country: string;
    city: string;
    birth_date: string;
    bio?: string;
    profile_image_url: string;
    is_verified: boolean;
  };
}

export default function ScoutProfile() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );
  const [initialFormData, setInitialFormData] = useState<ScoutFormData | null>(
    null,
  );

  // Separate date fields
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [formData, setFormData] = useState<ScoutFormData>({
    id: "",
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

  // Update birth_date from separate fields
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const formattedDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
      setFormData((prev) => ({ ...prev, birth_date: formattedDate }));
    }
  }, [birthDay, birthMonth, birthYear]);

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  const fetchScoutProfile = async () => {
    setPageLoading(true);
    try {
      const result = await fetchGraphQL<MyScoutProfileResponse>(
        MY_SCOUT_PROFILE,
      );

      if (result.data?.myScoutProfile) {
        const p = result.data.myScoutProfile;

        // Parse date of birth
        const dob = p.birth_date?.split("T")[0] || "";
        const [year, month, day] = dob.split("-");

        setBirthYear(year || "");
        setBirthMonth(month || "");
        setBirthDay(day || "");

        const data = {
          id: p.id || "",
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          email_address: p.email_address || "",
          phone: p.phone || "",
          birth_date: dob,
          nationality: p.nationality || "",
          country: p.country || "",
          city: p.city || "",
          bio: p.bio || "",
        };
        setFormData(data);
        setInitialFormData(data);

        if (p.profile_image_url) {
          setProfileImagePreview(getFullImageUrl(p.profile_image_url));
        }
      } else {
        setInitialFormData(null);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setInitialFormData(null);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchScoutProfile();
  }, [lang]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setProfileImagePreview(null);
    setProfileImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasFormChanged = () => {
    if (!initialFormData) {
      const isEmpty =
        !formData.first_name &&
        !formData.last_name &&
        !formData.email_address &&
        !formData.phone &&
        !formData.birth_date &&
        !formData.nationality &&
        !formData.country &&
        !formData.city &&
        !formData.bio;
      return !isEmpty || profileImageFile !== null;
    }
    return (
      formData.first_name !== initialFormData.first_name ||
      formData.last_name !== initialFormData.last_name ||
      formData.email_address !== initialFormData.email_address ||
      formData.phone !== initialFormData.phone ||
      formData.birth_date !== initialFormData.birth_date ||
      formData.nationality !== initialFormData.nationality ||
      formData.country !== initialFormData.country ||
      formData.city !== initialFormData.city ||
      formData.bio !== initialFormData.bio ||
      profileImageFile !== null
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!hasFormChanged()) {
      router.push("/scout/profile/clubcareer");
      return;
    }

    setLoading(true);

    const isUpdate = !!formData.id && formData.id !== "";

    // Create input object with profile_image inside it (as per backend schema)
    const input: Record<string, unknown> = {
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

    // Add profile_image to input if a file is selected (for both create and update)
    if (profileImageFile) {
      input.profile_image = profileImageFile;
    }

    let result;

    try {
      if (isUpdate) {
        result = await uploadGraphQL<UpdateScoutProfileResponse>(
          UPDATE_SCOUT_PROFILE,
          { input },
        );
      } else {
        result = await uploadGraphQL<CreateScoutProfileResponse>(
          CREATE_SCOUT_PROFILE,
          { input },
        );
      }

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data) {
        let updatedData: Partial<ScoutFormData> = {};
        if (isUpdate) {
          const updateResult = result as { data: UpdateScoutProfileResponse };
          const updated = updateResult.data.updateMyScoutProfile;
          if (updated) {
            updatedData = {
              first_name: updated.first_name,
              last_name: updated.last_name,
              nationality: updated.nationality,
              country: updated.country,
              city: updated.city,
              birth_date: updated.birth_date?.split("T")[0] || "",
              bio: updated.bio || "",
            };
          }
        } else {
          const createResult = result as { data: CreateScoutProfileResponse };
          if (createResult.data.createScoutProfile) {
            const created = createResult.data.createScoutProfile;
            updatedData = {
              id: created.id,
              first_name: created.first_name,
              last_name: created.last_name,
              email_address: created.email_address,
              phone: created.phone,
              nationality: created.nationality,
              country: created.country,
              city: created.city,
              birth_date: created.birth_date?.split("T")[0] || "",
              bio: created.bio || "",
            };
          }
        }

        setFormData((prev) => ({ ...prev, ...updatedData }));
        setInitialFormData(
          (prev) => ({ ...prev, ...updatedData } as ScoutFormData),
        );

        // Reset file states
        setProfileImageFile(null);

        toast.success(
          isUpdate
            ? "Profile Updated Successfully!"
            : "Profile Created Successfully!",
        );

        await fetchScoutProfile();
        router.push("/scout/profile/clubcareer");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-yellow-500" />
      </div>
    );
  }

  const inputStyle = {
    backgroundColor: isDark ? "#0b1736" : "white",
    color: isDark ? "white" : "black",
  };

  return (
    <div
      className={`min-h-screen py-40 transition ${
        isDark ? "bg-[#020b1c] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-center text-3xl font-bold mb-10 text-yellow-400">
          {t("Scout Profile")}
        </h1>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <Step icon={<User />} active isDark={isDark} />
          <Line isDark={isDark} />
          <Step icon={<Building2 />} isDark={isDark} />
        </div>

        {/* Profile Image Upload */}
        <div className="mb-12">
          <label
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${
              isDark
                ? "border-yellow-500/30 bg-[#0b1736]/40 hover:bg-[#0b1736]/60"
                : "border-yellow-400/50 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {profileImagePreview ? (
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={profileImagePreview}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="rounded-full object-cover border-2 border-yellow-400"
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
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <Input
            label={t("First Name")}
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
            required
          />
          <Input
            label={t("Last Name")}
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
            required
          />
          <Input
            label={t("Email Address")}
            name="email_address"
            value={formData.email_address}
            onChange={handleChange}
            icon={<Mail size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
            type="email"
            required
          />
          <Input
            label={t("Phone Number")}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={<Phone size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
            type="tel"
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
            <div className="flex gap-3">
              <div className="flex-1">
                <div
                  className={`flex items-center rounded-xl px-4 py-3 border transition-colors ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
                      : "bg-white border-gray-300 focus-within:border-yellow-400"
                  }`}
                  style={inputStyle}
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
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div
                  className={`flex items-center rounded-xl px-4 py-3 border transition-colors ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
                      : "bg-white border-gray-300 focus-within:border-yellow-400"
                  }`}
                  style={inputStyle}
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
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div
                  className={`flex items-center rounded-xl px-4 py-3 border transition-colors ${
                    isDark
                      ? "bg-[#0b1736] border-[#1e2d5a] focus-within:border-yellow-400"
                      : "bg-white border-gray-300 focus-within:border-yellow-400"
                  }`}
                  style={inputStyle}
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
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <Input
            label={t("Nationality")}
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            icon={<MapPin size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
          />
          <Input
            label={t("Country")}
            name="country"
            value={formData.country}
            onChange={handleChange}
            icon={<MapPin size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
          />
          <Input
            label={t("City")}
            name="city"
            value={formData.city}
            onChange={handleChange}
            icon={<MapPin size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
          />

          {/* Bio Field - Full Width */}
          <div className="md:col-span-2">
            <Textarea
              label={t("Bio")}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              icon={<AlignLeft size={18} />}
              isDark={isDark}
              textareaStyle={inputStyle}
              rows={4}
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
              <ChevronLeft className="inline" size={18} /> {t("Previous")}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                t("Next")
              )}
              <ChevronRight className="inline ml-2" size={18} />
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
  inputStyle,
  required = false,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDark: boolean;
  inputStyle: React.CSSProperties;
  required?: boolean;
}) {
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
        style={inputStyle}
      >
        <span className="text-yellow-400 mr-3">{icon}</span>
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={label}
          required={required}
          className={`bg-transparent outline-none w-full text-sm ${
            isDark
              ? "text-white placeholder-gray-500"
              : "text-black placeholder-gray-400"
          }`}
          style={inputStyle}
        />
      </div>
    </div>
  );
}

function Textarea({
  label,
  icon,
  name,
  value,
  onChange,
  isDark,
  textareaStyle,
  rows = 4,
}: {
  label: string;
  icon: React.ReactNode;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isDark: boolean;
  textareaStyle: React.CSSProperties;
  rows?: number;
}) {
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
        style={textareaStyle}
      >
        <span className="text-yellow-400 mr-3 mt-1">{icon}</span>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={label}
          className={`bg-transparent outline-none w-full text-sm resize-none ${
            isDark
              ? "text-white placeholder-gray-500"
              : "text-black placeholder-gray-400"
          }`}
          style={textareaStyle}
        />
      </div>
    </div>
  );
}