"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { toast } from "sonner";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

/* ================= TRANSLATIONS ================= */
const T: any = {
  en: {
    title: "Send Request",
    player: "Player",
    choosePlayer: "Choose Player",
    titleField: "Title",
    details: "Details",
    titlePlaceholder: "Title of request",
    detailsPlaceholder: "Details of request",
    send: "Send Request",
    sending: "Sending...",
    alertChoose: "Choose player first",
    success: "Request Sent ✅",
    error: "Error",
  },
  ar: {
    title: "إرسال طلب",
    player: "اللاعب",
    choosePlayer: "اختر لاعب",
    titleField: "العنوان",
    details: "التفاصيل",
    titlePlaceholder: "عنوان الطلب",
    detailsPlaceholder: "تفاصيل الطلب",
    send: "إرسال الطلب",
    sending: "جاري الإرسال...",
    alertChoose: "اختر لاعب أولاً",
    success: "تم إرسال الطلب ✅",
    error: "خطأ",
  },
  pt: {
    title: "Enviar Pedido",
    player: "Jogador",
    choosePlayer: "Escolher Jogador",
    titleField: "Título",
    details: "Detalhes",
    titlePlaceholder: "Título do pedido",
    detailsPlaceholder: "Detalhes do pedido",
    send: "Enviar Pedido",
    sending: "Enviando...",
    alertChoose: "Escolha um jogador primeiro",
    success: "Pedido enviado ✅",
    error: "Erro",
  },
  zh: {
    title: "发送请求",
    player: "球员",
    choosePlayer: "选择球员",
    titleField: "标题",
    details: "详情",
    titlePlaceholder: "请求标题",
    detailsPlaceholder: "请求详情",
    send: "发送请求",
    sending: "发送中...",
    alertChoose: "请先选择球员",
    success: "请求已发送 ✅",
    error: "错误",
  },
};

export default function SendRequestPage() {
  const { theme } = useTheme();

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") || "en"
      : "en";

  const t = T[lang] || T.en;

  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://72.62.28.146";

  const GET_PLAYERS = `
query GetAllPlayers($skip: Int, $take: Int) {
  getAllPlayers(skip: $skip, take: $take) {
    data {
      id
      first_name
      last_name
      profile_image_url
    }
  }
}
`;

  const SEND_REQUEST = `
mutation SendRequest($input: CreateRequestInput!) {
  sendRequest(input: $input) {
    id
    status
  }
}
`;

  const getImageUrl = (url: string | null) => {
    if (!url) return "/player.jpg";
    if (url.startsWith("http")) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: GET_PLAYERS,
          variables: { skip: 0, take: 10 },
        }),
      });

      const json = await res.json();
      setPlayers(json?.data?.getAllPlayers?.data || []);
    };

    fetchPlayers();
  }, []);

  const handleSend = async () => {
    if (!selectedPlayer) {
      toast.error(t.alertChoose);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          query: SEND_REQUEST,
          variables: {
            input: {
              player_id: selectedPlayer.id,
              type: "SCOUT_OFFER",
              message: details,
            },
          },
        }),
      });

      const json = await res.json();

      if (json.errors) {
        toast.error(json.errors[0].message);
        setLoading(false);
        return;
      }

      toast.success(t.success);
    } catch (err) {
      console.log(err);
      toast.error(t.error);
    }

    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen py-32 px-4 ${
        theme === "dark"
          ? "bg-[#020617] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-4xl mx-auto">

        <h1 className="text-center text-3xl font-bold text-yellow-500 mb-10">
          {t.title}
        </h1>

        {/* PLAYER */}
        <div className="mb-6 relative">
          <label className="block mb-2 font-bold">
            {t.player}
          </label>

          <div
            onClick={() => setOpen(!open)}
            className={`flex items-center justify-between p-4 rounded cursor-pointer border
            ${
              theme === "dark"
                ? "bg-[#0f172a] border-[#1e293b]"
                : "bg-white border-gray-300"
            }`}
          >
            {selectedPlayer ? (
              <div className="flex items-center gap-3">
                <img
                  src={getImageUrl(selectedPlayer.profile_image_url)}
                  className="w-10 h-10 rounded object-cover"
                />
                <span className="font-bold">
                  {selectedPlayer.first_name} {selectedPlayer.last_name}
                </span>
              </div>
            ) : (
              <span className="text-gray-400">{t.choosePlayer}</span>
            )}

            <ChevronDown />
          </div>

          {open && (
            <div
              className={`absolute w-full mt-2 rounded shadow-lg z-50 max-h-60 overflow-auto
              ${
                theme === "dark"
                  ? "bg-[#020617] border border-[#1e293b]"
                  : "bg-white border border-gray-300"
              }`}
            >
              {players.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPlayer(p);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-yellow-500/20 transition"
                >
                  <img
                    src={getImageUrl(p.profile_image_url)}
                    className="w-10 h-10 rounded object-cover"
                  />

                  <span className="font-bold">
                    {p.first_name} {p.last_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TITLE */}
        <div className="mb-6">
          <label className="block mb-2 font-bold">
            {t.titleField}
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            className={`w-full p-3 rounded border ${
              theme === "dark"
                ? "bg-[#0f172a] border-[#1e293b]"
                : "bg-white border-gray-300"
            }`}
          />
        </div>

        {/* DETAILS */}
        <div className="mb-6">
          <label className="block mb-2 font-bold">
            {t.details}
          </label>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            placeholder={t.detailsPlaceholder}
            className={`w-full p-3 rounded border ${
              theme === "dark"
                ? "bg-[#0f172a] border-[#1e293b]"
                : "bg-white border-gray-300"
            }`}
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSend}
          disabled={loading}
          className={`w-full py-4 font-bold rounded ${
            theme === "dark"
              ? "bg-[#081f55] border-x-2 border-yellow-400"
              : "bg-yellow-500"
          }`}
        >
          {loading ? t.sending : t.send}
        </button>

      </div>
    </div>
  );
}