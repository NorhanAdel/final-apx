"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import {
  User, Mail, Phone, MapPin,
  LayoutGrid, Plus, ChevronRight, ChevronLeft,
  ChevronDown, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";

/* ================= TYPES ================= */

type InputWithIconProps = {
  label: string;
  icon: React.ReactNode;
  isDark: boolean;
};

type SelectWithIconProps = {
  label: string;
  icon: React.ReactNode;
  isDark: boolean;
};

/* ================= PAGE ================= */

export default function PersonalInformation() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`min-h-screen py-20 flex items-center justify-center relative overflow-hidden transition
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}>

      {/* Background */}
      <div className={`absolute inset-0 opacity-10
        ${isDark ? "bg-[url('/pattern.png')]" : ""}`} />

      <div className="relative w-full max-w-5xl px-6 py-10">

        {/* Title */}
        <h1 className={`text-center text-3xl font-black italic mb-10 uppercase tracking-wider
          ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
          Personal Information
        </h1>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
            ${isDark 
              ? "bg-yellow-500/20 border border-yellow-500" 
              : "bg-yellow-100 border border-yellow-500"}`}>
            <User className="text-yellow-500" size={24} />
          </div>

          <div className={`w-16 h-[1px]
            ${isDark ? "bg-gray-600" : "bg-gray-300"}`} />

          <div className={`w-10 h-10 rounded-full flex items-center justify-center
            ${isDark ? "bg-[#0f1c3d] border border-gray-700" : "bg-white border border-gray-300"}`}>
            <LayoutGrid size={16} className="text-gray-400" />
          </div>
        </div>

        {/* Upload */}
        <div className="mb-10 flex justify-center">
          <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl aspect-[3/1] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition group overflow-hidden relative
              ${isDark 
                ? "bg-[#050b1d]/50 border-2 border-dashed border-yellow-600/30 hover:border-yellow-500/50" 
                : "bg-white border-2 border-dashed border-gray-300 hover:border-yellow-500"}`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} className="w-full h-full object-cover" />
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 p-1 rounded-full"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <div className={`p-4 rounded-xl mb-2
                  ${isDark ? "bg-[#0b1736]" : "bg-gray-100"}`}>
                  <Plus className="text-gray-400" size={32} />
                </div>
                <span className="text-gray-500 text-sm italic">Click To Add Photo</span>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <form className="grid md:grid-cols-2 gap-6">
          <InputWithIcon label="First Name" icon={<User size={18} />} isDark={isDark} />
          <InputWithIcon label="Last Name" icon={<User size={18} />} isDark={isDark} />
          <InputWithIcon label="Email" icon={<Mail size={18} />} isDark={isDark} />
          <InputWithIcon label="Phone" icon={<Phone size={18} />} isDark={isDark} />
          <SelectWithIcon label="Country" icon={<MapPin size={18} />} isDark={isDark} />
          <SelectWithIcon label="City" icon={<MapPin size={18} />} isDark={isDark} />
        </form>

        {/* Buttons */}
        <div className="flex justify-between mt-12">
          <button
            type="button"
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-10 py-3 rounded-md
              ${isDark 
                ? "bg-[#050b1d] border border-blue-900 text-gray-400" 
                : "bg-gray-200 text-black"}`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <button
            type="button"
            onClick={() => router.push("/agent/profile/clubcareer")}
            className={`flex items-center gap-2 px-12 py-3 rounded-md
              ${isDark 
                ? "bg-[#081f55] text-white border-x-2 border-yellow-500" 
                : "bg-yellow-400 text-black"}`}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= INPUT ================= */

function InputWithIcon({ label, icon, isDark }: InputWithIconProps) {
  return (
    <div className="space-y-2">
      <label className={`${isDark ? "text-gray-200" : "text-gray-700"} text-sm font-bold italic`}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500">
          {icon}
        </div>
        <input
          className={`w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition
            ${isDark 
              ? "bg-[#0b1736]/60 border border-[#1e2d5a] text-white" 
              : "bg-white border border-gray-300 text-black"}`}
        />
      </div>
    </div>
  );
}

/* ================= SELECT ================= */

function SelectWithIcon({ label, icon, isDark }: SelectWithIconProps) {
  return (
    <div className="space-y-2">
      <label className={`${isDark ? "text-gray-200" : "text-gray-700"} text-sm font-bold italic`}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500">
          {icon}
        </div>
        <select
          className={`w-full pl-12 pr-10 py-3 rounded-xl text-sm appearance-none outline-none
            ${isDark 
              ? "bg-[#0b1736]/60 border border-[#1e2d5a] text-white" 
              : "bg-white border border-gray-300 text-black"}`}
        >
          <option>Select</option>
        </select>

        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500" size={18} />
      </div>
    </div>
  );
}