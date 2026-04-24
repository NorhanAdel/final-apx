"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TRANSLATION ================= */
const T: any = {
  en: {
    loading: "Loading...",
    noData: "No sent requests",
    cancel: "Cancel",
  },
  ar: {
    loading: "جاري التحميل...",
    noData: "لا يوجد طلبات مرسلة",
    cancel: "إلغاء",
  },
  pt: {
    loading: "Carregando...",
    noData: "Nenhuma solicitação enviada",
    cancel: "Cancelar",
  },
  zh: {
    loading: "加载中...",
    noData: "没有已发送的请求",
    cancel: "取消",
  },
};

const GET_SENT = `
query {
  mySentRequests {
    id
    playerName
    status
    payload
    created_at
    player {
      profile_image_url
    }
  }
}
`;

const CANCEL = `
mutation CancelRequest($requestId: String!) {
  cancelRequest(requestId: $requestId) {
    id
    status
  }
}
`;

export default function SentList() {
  const { theme } = useTheme();

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "en"
      : "en";

  const t = T[lang] || T.en;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */
  const load = async () => {
    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        "Accept-Language": lang, // 👈 مهم للترجمة من الباك
      },
      body: JSON.stringify({ query: GET_SENT }),
    });

    const json = await res.json();
    setData(json?.data?.mySentRequests || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ================= CANCEL ================= */
  const handleCancel = async (id: string) => {
    await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        "Accept-Language": lang,
      },
      body: JSON.stringify({
        query: CANCEL,
        variables: { requestId: id },
      }),
    });

    load();
  };

  const getInitial = (name: string) => {
    if (!name) return "P";
    return name.charAt(0).toUpperCase();
  };

  if (loading)
    return <div className="text-center mt-10">{t.loading}</div>;

  return (
    <div className="space-y-4">

      {data.map((req) => (
        <div
          key={req.id}
          className={`rounded-xl px-5 py-4 flex justify-between items-center transition
          ${
            theme === "dark"
              ? "bg-[#0b1736]/60 border border-[#1e2d5a]"
              : "bg-white border border-gray-300 shadow-sm"
          }`}
        >

          {/* LEFT */}
          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-yellow-500 text-black">
              {getInitial(req.playerName)}
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-bold text-sm uppercase tracking-wide">
                {req.playerName}
              </span>

              <span className="text-xs opacity-70">
                {req.payload?.message}
              </span>

              <span className="text-[10px] opacity-50">
                {new Date(req.created_at).toLocaleDateString()}
              </span>
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* STATUS */}
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full
              ${
                req.status === "PENDING"
                  ? "bg-yellow-500/20 text-yellow-500"
                  : req.status === "ACCEPTED"
                  ? "bg-green-500/20 text-green-500"
                  : "bg-red-500/20 text-red-500"
              }`}
            >
              {req.status}
            </span>

  
            <button
              onClick={() => handleCancel(req.id)}
              className={`px-4 py-2 rounded-md font-bold text-xs uppercase transition
              ${
                theme === "dark"
                  ? "bg-[#081f55] border-x-2 border-red-400 text-white hover:bg-red-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {t.cancel}
            </button>

          </div>

        </div>
      ))}

      {data.length === 0 && (
        <div className="text-center opacity-60 mt-10">
          {t.noData}
        </div>
      )}

    </div>
  );
}