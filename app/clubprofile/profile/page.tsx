"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Plus,
  AlignLeft,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CREATE_CLUB_PROFILE,
  UPDATE_MY_CLUB_PROFILE,
} from "@/app/graphql/mutation/club.mutations";
import { GET_MY_CLUB_PROFILE } from "@/app/graphql/query/club.queries";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import Image from "next/image";
import useTranslate from "@/app/hooks/useTranslate";
import { uploadGraphQL } from "@/app/lib/uploadGraphQL";
import { useTheme } from "@/app/context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ClubFormData {
  id: string;
  club_name: string;
  email_address: string;
  phone: string;
  country: string;
  city: string;
  bio: string;
}

interface InputProps {
  label: string;
  icon: React.ReactNode;
  type?: string;
  name: keyof ClubFormData;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isDark: boolean;
}

interface TextareaProps {
  label: string;
  icon: React.ReactNode;
  name: keyof ClubFormData;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isDark: boolean;
}

interface CreateClubProfileResponse {
  createClubProfile: {
    id: string;
    club_name: string;
    email_address: string;
    phone: string;
    country: string;
    city: string;
    bio?: string;
    logo_url: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface UpdateClubProfileResponse {
  updateMyClubProfile: {
    id: string;
    club_name: string;
    email_address: string;
    phone: string;
    country: string;
    city: string;
    bio?: string;
    logo_url: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

interface MyClubProfileResponse {
  myClubProfile: {
    id: string;
    club_name: string;
    email_address: string;
    phone: string;
    country: string;
    city: string;
    bio?: string;
    logo_url: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
  };
}

export default function ClubProfilePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t, lang } = useTranslate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<ClubFormData | null>(null);

  const [formData, setFormData] = useState<ClubFormData>({
    id: "",
    club_name: "",
    email_address: "",
    phone: "",
    country: "",
    city: "",
    bio: "",
  });

  const isDark = theme === "dark";

  useEffect(() => {
    fetchClubProfile();
  }, [lang]);

  const fetchClubProfile = async () => {
    setPageLoading(true);
    try {
      const result = await fetchGraphQL<MyClubProfileResponse>(
        GET_MY_CLUB_PROFILE,
      );

      console.log("=== FETCH CLUB PROFILE RESPONSE ===");
      console.log("Full response:", result);
      console.log("Club data:", result.data?.myClubProfile);
      console.log("Logo URL:", result.data?.myClubProfile?.logo_url);

      if (result.data?.myClubProfile) {
        const profile = result.data.myClubProfile;
        const data = {
          id: profile.id,
          club_name: profile.club_name || "",
          email_address: profile.email_address || "",
          phone: profile.phone || "",
          country: profile.country || "",
          city: profile.city || "",
          bio: profile.bio || "",
        };
        setFormData(data);
        setInitialData(data);

        if (profile.logo_url) {
          const url = profile.logo_url.startsWith("http")
            ? profile.logo_url
            : `${API_URL}${profile.logo_url}`;
          console.log("Setting logo preview URL:", url);
          setLogoPreview(url);
        } else {
          console.log("No logo_url in response");
        }
      } else {
        console.log("No profile data in response");
        setInitialData(null);
      }
    } catch (error) {
      console.error("Failed to fetch club profile:", error);
      setInitialData(null);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("=== LOGO FILE SELECTED ===");
      console.log("File name:", file.name);
      console.log("File type:", file.type);
      console.log("File size:", file.size);
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const hasChanges = () => {
    if (!initialData) {
      return (
        formData.club_name !== "" ||
        formData.email_address !== "" ||
        formData.phone !== "" ||
        formData.country !== "" ||
        formData.city !== "" ||
        formData.bio !== "" ||
        logoFile !== null
      );
    }
    return (
      formData.club_name !== initialData.club_name ||
      formData.email_address !== initialData.email_address ||
      formData.phone !== initialData.phone ||
      formData.country !== initialData.country ||
      formData.city !== initialData.city ||
      formData.bio !== initialData.bio ||
      logoFile !== null
    );
  };

  // app/clubprofile/profile/page.tsx - handleSubmit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!hasChanges()) {
      router.push("/clubprofile");
      return;
    }

    setLoading(true);

    const isUpdate = !!formData.id;

    const input: Record<string, unknown> = {
      club_name: formData.club_name,
      email_address: formData.email_address,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      bio: formData.bio || undefined,
    };

    // Important: Add logo_image as a File object
    if (logoFile) {
      input.logo_image = logoFile;
      console.log("Added logo_image to input:", logoFile.name);
    }

    console.log("=== SUBMIT DEBUG ===");
    console.log("isUpdate:", isUpdate);
    console.log("input keys:", Object.keys(input));
    console.log(
      "input.logo_image:",
      input.logo_image instanceof File
        ? `File: ${input.logo_image.name}`
        : input.logo_image,
    );

    let result;

    try {
      if (isUpdate) {
        result = await uploadGraphQL<UpdateClubProfileResponse>(
          UPDATE_MY_CLUB_PROFILE,
          { input },
        );
      } else {
        result = await uploadGraphQL<CreateClubProfileResponse>(
          CREATE_CLUB_PROFILE,
          { input },
        );
      }

      if (result.errors) {
        toast.error(result.errors[0].message);
      } else if (result.data) {
        toast.success(isUpdate ? t("Profile Updated!") : t("Profile Created!"));
        await fetchClubProfile();
        router.push("/clubprofile");
      }
    } catch (error) {
      console.error("=== SUBMIT ERROR ===", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-yellow-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-20 transition ${
        isDark ? "bg-[#020b1c] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-center text-3xl font-bold mb-10 text-yellow-400">
          {t("Club Profile")}
        </h1>

        <div className="mb-12">
          <label
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${
              isDark
                ? "border-yellow-500/30 bg-[#0b1736]/40 hover:bg-[#0b1736]/60"
                : "border-yellow-400/50 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {logoPreview ? (
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={logoPreview}
                    alt="Club Logo"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-2 border-yellow-400"
                    unoptimized
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeLogo();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={14} className="text-white" />
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
                {t("Click To Add Club Logo")}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <Input
            label={t("Club Name")}
            name="club_name"
            value={formData.club_name}
            onChange={handleChange}
            icon={<Building2 size={18} />}
            isDark={isDark}
          />
          <Input
            label={t("Email Address")}
            name="email_address"
            value={formData.email_address}
            onChange={handleChange}
            icon={<Mail size={18} />}
            isDark={isDark}
          />
          <Input
            label={t("Phone Number")}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            icon={<Phone size={18} />}
            isDark={isDark}
          />
          <Input
            label={t("Country")}
            name="country"
            value={formData.country}
            onChange={handleChange}
            icon={<MapPin size={18} />}
            isDark={isDark}
          />
          <Input
            label={t("City")}
            name="city"
            value={formData.city}
            onChange={handleChange}
            icon={<MapPin size={18} />}
            isDark={isDark}
          />

          <div className="md:col-span-2">
            <Textarea
              label={t("Bio / Description")}
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              icon={<AlignLeft size={18} />}
              isDark={isDark}
            />
          </div>

          <div className="md:col-span-2 flex justify-between mt-10">
            <button
              type="button"
              onClick={() => router.push("/clubprofile")}
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
              {loading ? t("Saving...") : t("Save")}
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
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
}: InputProps & { isDark: boolean }) {
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

function Textarea({
  label,
  icon,
  name,
  value,
  onChange,
  isDark,
}: TextareaProps & { isDark: boolean }) {
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
        />
      </div>
    </div>
  );
}
