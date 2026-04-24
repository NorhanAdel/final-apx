"use client";

import InboxList from "@/app/components/InboxList";
import SentList from "@/app/components/SentList";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";

/* ================= 4 LANGS ================= */
const T: any = {
  en: {
    title: "Requests",
    inbox: "Inbox",
    sent: "Sent",
    send: "Send Request 📩",
  },
  ar: {
    title: "الطلبات",
    inbox: "الوارد",
    sent: "الصادر",
    send: "إرسال طلب 📩",
  },
  pt: {
    title: "Solicitações",
    inbox: "Entrada",
    sent: "Enviadas",
    send: "Enviar Solicitação 📩",
  },
  zh: {
    title: "请求",
    inbox: "收件箱",
    sent: "已发送",
    send: "发送请求 📩",
  },
};

export default function MessagesPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("inbox");

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "en"
      : "en";

  const t = T[lang] || T.en;

  return (
    <div
      className={`min-h-screen p-4 ${
        theme === "dark"
          ? "bg-[#020617] text-white"
          : "bg-[#f9fafb] text-black"
      }`}
    >
      <div className="max-w-5xl py-32 mx-auto">

        <h1
          className={`text-center text-2xl font-bold mb-6 italic ${
            theme === "dark"
              ? "text-yellow-400"
              : "text-yellow-600"
          }`}
        >
          {t.title}
        </h1>

        <div
          className={`flex border rounded-md mb-6 overflow-hidden ${
            theme === "dark"
              ? "border-[#1e293b]"
              : "border-gray-300"
          }`}
        >
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex-1 py-3 font-bold ${
              activeTab === "inbox"
                ? theme === "dark"
                  ? "bg-[#0f172a] text-yellow-400"
                  : "bg-gray-200 text-yellow-600"
                : "text-gray-400"
            }`}
          >
            {t.inbox}
          </button>

          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-3 font-bold ${
              activeTab === "sent"
                ? theme === "dark"
                  ? "bg-[#0f172a] text-yellow-400"
                  : "bg-gray-200 text-yellow-600"
                : "text-gray-400"
            }`}
          >
            {t.sent}
          </button>
        </div>

        {activeTab === "inbox" ? <InboxList /> : <SentList />}

        <Link href="/scout/profile/sendrequest">
          <button
            className={`w-full mt-8 py-4 rounded-md font-bold ${
              theme === "dark"
                ? "bg-[#081f55] border-x-2 border-yellow-400 text-white"
                : "bg-yellow-500 text-black"
            }`}
          >
            {t.send}
          </button>
        </Link>

      </div>
    </div>
  );
}