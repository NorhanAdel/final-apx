"use client";

import {
  User,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";  

export default function ClubCareer() {
  const router = useRouter();
  const { theme } = useTheme();  

  const bgColor = theme === "dark" ? "bg-[#020617]" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-black";
  const cardBg = theme === "dark" ? "bg-[#0b1736]/60" : "bg-gray-100";
  const borderColor = theme === "dark" ? "border-[#1e2d5a]" : "border-gray-300";
  const placeholderColor = theme === "dark" ? "placeholder:text-gray-500" : "placeholder:text-gray-400";

  return (
    <div className={`min-h-screen py-20 flex items-center justify-center relative overflow-hidden ${bgColor} ${textColor}`}>
      
      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')] bg-center bg-cover"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <div className="w-[600px] h-[600px] border-[40px] border-white rounded-full"></div>
      </div>

      <div className="relative w-full max-w-4xl px-6 py-10">
        <h1 className={`text-center text-3xl font-black italic mb-10 uppercase tracking-wider ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`}>
          Club Career
        </h1>

        <div className="flex items-center justify-center gap-4 mb-16">
          <div className={`w-10 h-10 rounded-full ${theme === "dark" ? "bg-[#0f1c3d] border-gray-700" : "bg-gray-200 border-gray-400"} flex items-center justify-center`}>
            <User className={theme === "dark" ? "text-gray-400" : "text-gray-700"} size={20} />
          </div>
          <div className={`w-20 h-[1px] ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`}></div>
          <div className={`w-14 h-14 rounded-full ${theme === "dark" ? "bg-yellow-500/20 border-yellow-500" : "bg-yellow-300/30 border-yellow-400"} flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]`}>
            <div className="w-6 h-6 border-2 border-yellow-500 rounded-sm flex items-center justify-center">
                <LayoutGrid className="text-yellow-500" size={16} />
            </div>
          </div>
        </div>

        <form className="space-y-8 max-w-3xl mx-auto">
          <FormSelect
            label="Current Club"
            value=""
            leftContent={
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded-full overflow-hidden flex items-center justify-center border border-yellow-600">
                    <span className="text-[10px] text-black font-bold">CR7</span>
                </div>
                <span className={`text-sm italic ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Al Nassr FC</span>
              </div>
            }
          />

          <FormSelect
            label="Previous Clubs"
            value=""
            leftContent={
              <span className={`text-sm italic ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Sporting CP , Manchester United , Real Madrid , Juventus
              </span>
            }
          />
        </form>

        <div className="flex justify-between mt-20">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-10 py-3 rounded-md font-bold italic transition-all ${theme === "dark" ? "bg-[#081f55] border-x-2 border-yellow-500 text-white hover:bg-[#0b1736]" : "bg-gray-200 border-gray-400 text-black hover:bg-gray-300"}`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <button
            type="submit"
            className={`flex items-center gap-2 px-14 py-3 rounded-md font-bold italic transition-all shadow-lg uppercase tracking-widest ${theme === "dark" ? "bg-[#081f55] border-x-2 border-yellow-500 text-white hover:bg-[#0b2b6b]" : "bg-gray-300 border-gray-400 text-black hover:bg-gray-400"}`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSelect({ label, value, leftContent }: { label: string; value: string; leftContent?: React.ReactNode }) {
  const { theme } = useTheme();
  const cardBg = theme === "dark" ? "bg-[#0b1736]/60" : "bg-gray-100";
  const borderColor = theme === "dark" ? "border-[#1e2d5a]" : "border-gray-300";
  const placeholderColor = theme === "dark" ? "placeholder:text-gray-500" : "placeholder:text-gray-400";
  return (
    <div className="space-y-3 relative">
      <label className={`text-sm font-bold italic block ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{leftContent}</div>
        <select className={`w-full ${cardBg} ${borderColor} border rounded-xl px-10 py-4 outline-none text-sm appearance-none ${placeholderColor} focus:border-yellow-500/50 transition-colors`}>
          <option value={value}></option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none">
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
}