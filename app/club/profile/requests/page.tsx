"use client";
import InboxList from "@/app/components/InboxList";
import SentList from "@/app/components/SentList";
import { useState } from "react";
import Link from "next/link"; 
import { useTheme } from "../../../context/ThemeContext";

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen p-4 font-sans transition-colors
      ${isDark ? "bg-[#020617] text-white" : "bg-gray-100 text-black"}`}>
      
      <div className="max-w-5xl py-20 mx-auto">
        
        <h1 className={`text-center text-2xl font-bold mb-6 italic
          ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>Requests</h1>

        <div className={`flex border rounded-md mb-6 overflow-hidden
          ${isDark ? "border-[#1e293b]" : "border-gray-300"}`}>
          
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex-1 py-3 font-bold transition-colors ${
              activeTab === "inbox" 
                ? `${isDark ? "bg-[#0f172a] text-yellow-400" : "bg-yellow-100 text-yellow-700"}`
                : `${isDark ? "bg-transparent text-gray-400" : "bg-transparent text-gray-500"}`
            }`}
          >
            Inbox
          </button>
          
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-3 font-bold transition-colors ${
              activeTab === "sent" 
                ? `${isDark ? "bg-[#0f172a] text-yellow-400" : "bg-yellow-100 text-yellow-700"}`
                : `${isDark ? "bg-transparent text-gray-400" : "bg-transparent text-gray-500"}`
            }`}
          >
            Sent
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === "inbox" ? <InboxList /> : <SentList />}
        </div>

        <Link href="/agent/profile/sendrequest" className="block w-full mt-8">
          <button className={`w-full py-4 rounded-md flex items-center justify-center gap-2 font-bold text-lg transition-all
            ${isDark 
              ? "bg-[#081f55] border-x-2 border-yellow-500 hover:bg-[#1e293b] text-white"
              : "bg-yellow-400 border-x-2 border-yellow-600 hover:bg-yellow-300 text-black"
            }`}
          >
            Sent Request <span className={`${isDark ? "text-yellow-400" : "text-yellow-700"}`}>📩</span>
          </button>
        </Link>
        
      </div>
    </div>
  );
}