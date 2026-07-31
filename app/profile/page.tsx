"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Flag,
  Ruler,
  Weight,
  Trophy,
  Users,
  ShieldCheck,
  Camera,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Plus,
  ExternalLink,
  AlignLeft,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";
import {
  CREATE_PLAYER_PROFILE,
  UPDATE_PLAYER_PROFILE,
} from "@/app/graphql/mutation/player.mutations";
import { GET_MY_PLAYER_PROFILE } from "@/app/graphql/query/player.queries";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import Image from "next/image";
import useTranslate from "../hooks/useTranslate";
import { uploadGraphQL } from "../lib/uploadGraphQL";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

interface PlayerFormData {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone: string;
  date_of_birth: string;
  nationality: string;
  country: string;
  city: string;
  height_cm: string;
  weight_kg: string;
  bio: string;
}

interface InputProps {
  label: string;
  icon: React.ReactNode;
  type?: string;
  name: keyof PlayerFormData;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDark: boolean;
}

interface TextareaProps {
  label: string;
  icon: React.ReactNode;
  name: keyof PlayerFormData;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isDark: boolean;
}

interface Variables extends Record<string, unknown> {
  playerId?: string;
  input: {
    first_name: string;
    last_name: string;
    email_address: string;
    phone: string;
    nationality: string;
    country: string;
    city: string;
    height_cm: number;
    weight_kg: number;
    date_of_birth: string;
    bio?: string;
  };
  profileImage?: File;
  verificationDoc?: File;
}

interface CreatePlayerProfileResponse {
  createPlayerProfile: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    phone: string;
    nationality: string;
    country: string;
    city: string;
    height_cm: number;
    weight_kg: number;
    date_of_birth: string;
    bio?: string;
    profile_image_url: string;
    verification_doc_url: string;
    is_verified: boolean;
    created_at: string;
  };
}

interface UpdatePlayerProfileResponse {
  updateProfileWithFiles: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    phone: string;
    nationality: string;
    country: string;
    city: string;
    height_cm: number;
    weight_kg: number;
    date_of_birth: string;
    bio?: string;
    profile_image_url: string;
    verification_doc_url: string;
  };
}

interface MyPlayerProfileResponse {
  myPlayerProfile: {
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
    phone: string;
    nationality: string;
    country: string;
    city: string;
    height_cm: number;
    weight_kg: number;
    date_of_birth: string;
    bio?: string;
    profile_image_url: string;
    verification_doc_url: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export default function ProfilePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );
  const [existingDocUrl, setExistingDocUrl] = useState<string | null>(null);
  const [initialFormData, setInitialFormData] = useState<PlayerFormData | null>(
    null,
  );

  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [formData, setFormData] = useState<PlayerFormData>({
    id: "",
    first_name: "",
    last_name: "",
    email_address: "",
    phone: "",
    date_of_birth: "",
    nationality: "",
    country: "",
    city: "",
    height_cm: "",
    weight_kg: "",
    bio: "",
  });

  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      const formattedDate = `${birthYear}-${birthMonth.padStart(
        2,
        "0",
      )}-${birthDay.padStart(2, "0")}`;
      setFormData((prev) => ({ ...prev, date_of_birth: formattedDate }));
    }
  }, [birthDay, birthMonth, birthYear]);

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  const fetchPlayerProfile = async () => {
    setPageLoading(true);
    try {
      const result = await fetchGraphQL<MyPlayerProfileResponse>(
        GET_MY_PLAYER_PROFILE,
      );

      if (result.data?.myPlayerProfile) {
        const p = result.data.myPlayerProfile;

        const dob = p.date_of_birth?.split("T")[0] || "";
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
          date_of_birth: dob,
          nationality: p.nationality || "",
          country: p.country || "",
          city: p.city || "",
          height_cm: p.height_cm ? String(p.height_cm) : "",
          weight_kg: p.weight_kg ? String(p.weight_kg) : "",
          bio: p.bio || "",
        };
        setFormData(data);
        setInitialFormData(data);

        if (p.profile_image_url) {
          setProfileImagePreview(getFullImageUrl(p.profile_image_url));
        }

        if (p.verification_doc_url) {
          setExistingDocUrl(getFullImageUrl(p.verification_doc_url));
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
    fetchPlayerProfile();
  }, [lang]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: "profile" | "doc",
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (type === "profile") {
        setProfileImageFile(file);
        setProfileImagePreview(URL.createObjectURL(file));
      } else {
        setVerificationFile(file);
      }
    }
  };

  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const hasFormChanged = () => {
    if (!initialFormData) {
      const isEmpty =
        !formData.first_name &&
        !formData.last_name &&
        !formData.email_address &&
        !formData.phone &&
        !formData.date_of_birth &&
        !formData.city &&
        !formData.height_cm &&
        !formData.weight_kg &&
        !formData.bio;
      return !isEmpty || profileImageFile !== null || verificationFile !== null;
    }
    return (
      formData.first_name !== initialFormData.first_name ||
      formData.last_name !== initialFormData.last_name ||
      formData.email_address !== initialFormData.email_address ||
      formData.phone !== initialFormData.phone ||
      formData.date_of_birth !== initialFormData.date_of_birth ||
      formData.nationality !== initialFormData.nationality ||
      formData.country !== initialFormData.country ||
      formData.city !== initialFormData.city ||
      formData.height_cm !== initialFormData.height_cm ||
      formData.weight_kg !== initialFormData.weight_kg ||
      formData.bio !== initialFormData.bio ||
      profileImageFile !== null ||
      verificationFile !== null
    );
  };

  const getErrorMessage = (result: any) => {
    if (!result) return "Unknown error";
    if (result?.errors?.length) {
      return result.errors[0]?.message || "Error occurred";
    }
    if (result?.message) {
      return result.message;
    }
    return "Something went wrong";
  };

  const getFriendlyError = (message: string, lang: string) => {
    if (!message) {
      return lang === "ar" ? "حدث خطأ ما" : "Something went wrong";
    }
    const msg = message.toLowerCase();
    if (msg.includes("email")) {
      return lang === "ar"
        ? "البريد الإلكتروني غير صحيح أو مستخدم"
        : "Email is invalid or already used";
    }
    if (msg.includes("phone")) {
      return lang === "ar" ? "رقم الهاتف غير صحيح" : "Phone number is invalid";
    }
    if (msg.includes("unauthorized")) {
      return lang === "ar" ? "يجب تسجيل الدخول أولاً" : "You must login first";
    }
    if (msg.includes("required")) {
      return lang === "ar"
        ? "من فضلك املأ جميع البيانات المطلوبة"
        : "Please fill all required fields";
    }
    return message;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!hasFormChanged()) {
      router.push("/profile/football");
      return;
    }

    setLoading(true);

    const isUpdate = !!formData.id && formData.id !== "";
    const hasFiles = profileImageFile !== null || verificationFile !== null;

    const input = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email_address: formData.email_address,
      phone: formData.phone,
      nationality: formData.nationality,
      country: formData.country,
      city: formData.city,
      height_cm: formData.height_cm ? parseInt(formData.height_cm) : 0,
      weight_kg: formData.weight_kg ? parseInt(formData.weight_kg) : 0,
      date_of_birth: formData.date_of_birth,
      bio: formData.bio || undefined,
    };

    let result;

    if (isUpdate) {
      const variables: Variables = {
        playerId: formData.id,
        input,
      };

      if (profileImageFile) {
        variables.profileImage = profileImageFile;
      }
      if (verificationFile) {
        variables.verificationDoc = verificationFile;
      }

      if (hasFiles && (profileImageFile || verificationFile)) {
        result = await uploadGraphQL<UpdatePlayerProfileResponse>(
          UPDATE_PLAYER_PROFILE,
          variables,
        );
      } else {
        const cleanVariables: Record<string, unknown> = {
          playerId: formData.id,
          input,
        };
        result = await fetchGraphQL<UpdatePlayerProfileResponse>(
          UPDATE_PLAYER_PROFILE,
          cleanVariables,
        );
      }
    } else {
      const variables: Variables = { input };

      if (profileImageFile) {
        variables.profileImage = profileImageFile;
      }
      if (verificationFile) {
        variables.verificationDoc = verificationFile;
      }

      if (profileImageFile || verificationFile) {
        result = await uploadGraphQL<CreatePlayerProfileResponse>(
          CREATE_PLAYER_PROFILE,
          variables,
        );
      } else {
        result = await fetchGraphQL<CreatePlayerProfileResponse>(
          CREATE_PLAYER_PROFILE,
          { input },
        );
      }
    }

    if (result.errors) {
      toast.error(getFriendlyError(getErrorMessage(result), lang));
    } else if (result.data) {
      let updatedData: Partial<PlayerFormData> = {};
      if (isUpdate) {
        const updateResult = result as { data: UpdatePlayerProfileResponse };
        if (updateResult.data.updateProfileWithFiles) {
          const updated = updateResult.data.updateProfileWithFiles;
          updatedData = {
            first_name: updated.first_name,
            last_name: updated.last_name,
            nationality: updated.nationality,
            country: updated.country,
            city: updated.city,
            height_cm: updated.height_cm ? String(updated.height_cm) : "",
            weight_kg: updated.weight_kg ? String(updated.weight_kg) : "",
            date_of_birth: updated.date_of_birth?.split("T")[0] || "",
            bio: updated.bio || "",
          };
        }
      } else {
        const createResult = result as { data: CreatePlayerProfileResponse };
        if (createResult.data.createPlayerProfile) {
          const created = createResult.data.createPlayerProfile;
          updatedData = {
            id: created.id,
            first_name: created.first_name,
            last_name: created.last_name,
            email_address: created.email_address,
            phone: created.phone,
            nationality: created.nationality,
            country: created.country,
            city: created.city,
            height_cm: created.height_cm ? String(created.height_cm) : "",
            weight_kg: created.weight_kg ? String(created.weight_kg) : "",
            date_of_birth: created.date_of_birth?.split("T")[0] || "",
            bio: created.bio || "",
          };
        }
      }

      setFormData((prev) => ({ ...prev, ...updatedData }));
      setInitialFormData(
        (prev) => ({ ...prev, ...updatedData } as PlayerFormData),
      );

      setProfileImageFile(null);
      setVerificationFile(null);

      toast.success(
        isUpdate
          ? t("Profile Updated Successfully!")
          : t("Profile Created Successfully!"),
      );

      await fetchPlayerProfile();
      router.push("/profile/football");
    }

    setLoading(false);
  };

  const isDark = theme === "dark";

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-yellow-400">{t("loading")}</div>
      </div>
    );
  }

  const inputStyle = {
    backgroundColor: isDark ? "#0b1736" : "white",
    color: isDark ? "white" : "black",
  };

  return (
    <div
      className={`min-h-screen py-30 pt-30 transition ${
        isDark ? "bg-[#020b1c] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-center text-3xl font-bold mb-10 text-yellow-400">
          {t("Personal Information")}
        </h1>

        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-10 overflow-x-auto pb-2">
          <Step icon={<User size={20} />} active isDark={isDark} onClick={() => router.push('/profile')} />
          <Line isDark={isDark} />
          <Step icon={<Trophy size={20} />} isDark={isDark} onClick={() => router.push('/profile/football')} />
          <Line isDark={isDark} />
          <Step icon={<Users size={20} />} isDark={isDark} onClick={() => router.push('/profile/clubcareer')} />
          <Line isDark={isDark} />
          <Step icon={<ShieldCheck size={20} />} isDark={isDark} onClick={() => router.push('/profile/legal-status')} />
          <Line isDark={isDark} />
          <Step icon={<Camera size={20} />} isDark={isDark} onClick={() => router.push('/profile/imagesreels')} />
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
              {profileImagePreview ? (
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={profileImagePreview}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400"
                    unoptimized
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeProfileImage();
                    }}
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
              onChange={(e) => handleFileChange(e, "profile")}
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
          />
          <Input
            label={t("Last Name")}
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            icon={<User size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
          />
          <Input
            label={t("Email Address")}
            name="email_address"
            value={formData.email_address}
            onChange={handleChange}
            icon={<Mail size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
          />
          <Input
            label={t("Phone Number")}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={<Phone size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
          />

          <div className="space-y-2">
            <label
              className={`block text-sm mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("Date of Birth")}
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
                  className={`flex items-center rounded-xl px-4 py-3 border ${
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
                  className={`flex items-center rounded-xl px-4 py-3 border ${
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
            icon={<Flag size={18} />}
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
          <Input
            label={t("Height (cm)")}
            name="height_cm"
            type="number"
            value={formData.height_cm}
            onChange={handleChange}
            icon={<Ruler size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
          />
          <Input
            label={t("Weight (kg)")}
            name="weight_kg"
            type="number"
            value={formData.weight_kg}
            onChange={handleChange}
            icon={<Weight size={18} />}
            isDark={isDark}
            inputStyle={inputStyle}
          />

          <div className="md:col-span-2">
            <Textarea
              label={t("Bio")}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              icon={<AlignLeft size={18} />}
              isDark={isDark}
              textareaStyle={inputStyle}
            />
          </div>

          <div className="md:col-span-2">
            <label
              className={`block text-sm mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t("Verification Document (Medals or Championships)")} (
              {t("Optional")})
            </label>
            <div
              className={`relative flex items-center rounded-xl px-4 py-3 border transition-colors group ${
                isDark
                  ? "bg-[#0b1736] border-[#1e2d5a] hover:border-yellow-400"
                  : "bg-white border-gray-300 hover:border-yellow-400"
              }`}
              style={inputStyle}
            >
              <span className="text-yellow-400 mr-3 z-10 pointer-events-none">
                <FileText size={20} />
              </span>
              <div className="flex flex-col flex-1 overflow-hidden z-20">
                <span
                  className={`text-sm truncate pointer-events-none ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {verificationFile
                    ? verificationFile.name
                    : existingDocUrl
                    ? t("Document already uploaded")
                    : t("Upload verification doc (optional)")}
                </span>
                {!verificationFile && existingDocUrl && (
                  <a
                    href={existingDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-yellow-500 hover:underline flex items-center gap-1 mt-0.5 w-fit relative z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("View Current Document")} <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={(e) => handleFileChange(e, "doc")}
              />
              <Upload
                size={18}
                className="ml-auto text-gray-500 z-10 pointer-events-none"
              />
            </div>
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
              {loading ? t("Saving...") : t("Next")}{" "}
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
    <div className={`w-8 sm:w-10 h-[2px] ${isDark ? "bg-gray-500" : "bg-gray-300"}`} />
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
}: InputProps & { isDark: boolean; inputStyle: React.CSSProperties }) {
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
}: TextareaProps & { isDark: boolean; textareaStyle: React.CSSProperties }) {
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
          rows={4}
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