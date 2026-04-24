"use client";

import { useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  MapPin,
  Lock,
  Search,
  LayoutGrid,
  Plus,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Sun,
  Moon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "../../../context/ThemeContext";  

export default function PersonalInformation() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const darkClasses = {
    bg: "bg-[#020617] text-white",
    cardBg: "bg-[#050b1d]/50 border-[#1e2d5a]",
    inputBg: "bg-[#0b1736]/60 border-[#1e2d5a]",
    inputText: "text-gray-400 placeholder:text-gray-500",
    label: "text-gray-200",
    buttonPrev: "bg-[#050b1d] border-blue-900 text-gray-400 hover:bg-[#0b1736]",
    buttonNext: "bg-[#081f55] border-x-2 border-yellow-500 text-white hover:bg-[#0b2b6b]",
    heading: "text-yellow-400",
    icon: "text-yellow-500"
  };

  const lightClasses = {
    bg: "bg-gray-100 text-black",
    cardBg: "bg-white/50 border-gray-300",
    inputBg: "bg-white/60 border-gray-300",
    inputText: "text-gray-700 placeholder:text-gray-400",
    label: "text-gray-700",
    buttonPrev: "bg-gray-200 border-gray-400 text-black hover:bg-gray-300",
    buttonNext: "bg-blue-600 border-none text-white hover:bg-blue-700",
    heading: "text-blue-700",
    icon: "text-blue-600"
  };

  const classes = theme === "dark" ? darkClasses : lightClasses;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`min-h-screen py-20 flex items-center justify-center relative overflow-hidden ${classes.bg}`}>
      
     

      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')] bg-center bg-cover"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="w-[600px] h-[600px] border-[40px] border-white rounded-full"></div>
      </div>

      <div className="relative w-full max-w-5xl px-6 py-10">
        <h1 className={`text-center text-3xl font-black italic mb-10 uppercase tracking-wider ${classes.heading}`}>
          Personal Information
        </h1>

        <div className="flex items-center justify-center gap-4 mb-10">
          <div className={`w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]`}>
            <User className={classes.icon} size={24} />
          </div>
          <div className="w-16 h-[1px] bg-gray-600"></div>
          <div className={`w-10 h-10 rounded-full ${classes.inputBg} border border-gray-700 flex items-center justify-center`}>
            <div className="w-4 h-4 border border-gray-400 opacity-50">
              <LayoutGrid className="text-gray-400" size={16} />
            </div>
          </div>
        </div>

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
            className={`w-full max-w-2xl aspect-[3/1] ${classes.cardBg} border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 transition-all group overflow-hidden relative`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-bold italic">Change Photo</p>
                </div>
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <div className="bg-[#0b1736] p-4 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="text-gray-400" size={32} />
                </div>
                <span className={`text-sm italic font-medium ${classes.inputText}`}>
                  Click To Add Profile Photo
                </span>
              </>
            )}
          </div>
        </div>

        <form className="grid md:grid-cols-2 gap-x-6 gap-y-5">
          <InputWithIcon label="First Name" icon={<User size={18} />} placeholder="First Name" classes={classes} />
          <InputWithIcon label="Last Name" icon={<User size={18} />} placeholder="Last Name" classes={classes} />
          <InputWithIcon label="Email Address" icon={<Mail size={18} />} placeholder="Email" classes={classes} />
          <InputWithIcon label="Phone Number" icon={<Phone size={18} />} placeholder="Phone Number" classes={classes} />
          <SelectWithIcon label="Date of Birth" icon={<Calendar size={18} />} placeholder="Date" classes={classes} />
          <SelectWithIcon label="Nationality" icon={<Globe size={18} />} placeholder="Nationality" classes={classes} />
          <SelectWithIcon label="Country" icon={<MapPin size={18} />} placeholder="Country" classes={classes} />
          <SelectWithIcon label="City" icon={<MapPin size={18} />} placeholder="City" classes={classes} />
          <InputWithIcon label="Password" icon={<Lock size={18} />} placeholder="Password" isPassword classes={classes} />
          <SelectWithIcon label="Role" icon={<Search size={18} />} placeholder="Scout" classes={classes} />

          <div className="md:col-span-2 mt-2">
            <label className={`text-sm font-bold block mb-2 italic ${classes.label}`}>
              Description
            </label>
            <textarea
              placeholder="Description of player"
              className={`${classes.inputBg} border border-[#1e2d5a] rounded-xl p-4 outline-none text-sm focus:border-yellow-500/50 transition-colors resize-none ${classes.inputText}`}
            />
          </div>
        </form>

        <div className="flex justify-between mt-12">
          <button
            type="button"
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-10 py-3 rounded-md font-bold italic transition-all ${classes.buttonPrev}`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <button
            type="button"
            className={`flex items-center gap-2 px-12 py-3 rounded-md font-bold italic shadow-lg transition-all ${classes.buttonNext}`}
          >
            Submit
            <ChevronRight size={20} className="text-yellow-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InputWithIcon({ label, icon, placeholder, isPassword = false, classes }: any) {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-bold block italic ${classes.label}`}>{label}*</label>
      <div className="relative flex items-center">
        <div className={`absolute left-4 ${classes.icon}`}>{icon}</div>
        <input
          type={isPassword ? "password" : "text"}
          placeholder={placeholder}
          className={`w-full ${classes.inputBg} border rounded-xl pl-12 pr-4 py-3 outline-none text-sm ${classes.inputText} focus:border-yellow-500/50 transition-colors`}
        />
      </div>
    </div>
  );
}

function SelectWithIcon({ label, icon, placeholder, classes }: any) {
  return (
    <div className="space-y-2">
      <label className={`text-sm font-bold block italic ${classes.label}`}>{label}*</label>
      <div className="relative flex items-center">
        <div className={`absolute left-4 ${classes.icon}`}>{icon}</div>
        <select className={`w-full ${classes.inputBg} border rounded-xl pl-12 pr-10 py-3 outline-none text-sm appearance-none ${classes.inputText} focus:border-yellow-500/50 transition-colors`}>
          <option value="">{placeholder}</option>
        </select>
        <div className="absolute right-4 pointer-events-none text-yellow-500">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
}