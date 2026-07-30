"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import { fetchGraphQL } from "../lib/fetchGraphQL";

// =========================
// TYPES
// =========================
type SubscriptionType = {
  id: string;

  package: {
    max_photos: number;
    max_videos: number;
    max_ads: number;
  };

  is_active: boolean;
  remaining_days: number;
};

// =========================
// TRANSLATIONS
// =========================
const translations: any = {
  ar: {
    checkout: "الدفع",
    paymentDetails: "بيانات الدفع",
    cardName: "اسم صاحب البطاقة",
    cardNumber: "رقم البطاقة",
    expiryMonth: "الشهر",
    expiryYear: "السنة",
    cvv: "CVV",
    payNow: "ادفع الآن",
    processing: "جارى الدفع...",
    success: "تم الدفع بنجاح",
    summary: "ملخص الاشتراك",
    package: "الباقة",
    photos: "الصور",
    videos: "الفيديوهات",
    ads: "الإعلانات",
    remainingDays: "الأيام المتبقية",
    noPackage: "لا يوجد اشتراك",
    paymentError: "حدث خطأ أثناء الدفع",
    securePayment: "دفع آمن ومشفر",

    BASIC: "مبتدئ",
    PROFESSIONAL: "محترف",
    PREMIUM: "لاعب محترف",
  },

  en: {
    checkout: "Checkout",
    paymentDetails: "Payment Details",
    cardName: "Card Holder Name",
    cardNumber: "Card Number",
    expiryMonth: "Month",
    expiryYear: "Year",
    cvv: "CVV",
    payNow: "Pay Now",
    processing: "Processing...",
    success: "Payment Successful",
    summary: "Subscription Summary",
    package: "Package",
    photos: "Photos",
    videos: "Videos",
    ads: "Ads",
    remainingDays: "Remaining Days",
    noPackage: "No Subscription Found",
    paymentError: "Payment Error",
    securePayment: "Secure Payment",

    BASIC: "Basic",
    PROFESSIONAL: "Professional",
    PREMIUM: "Premium Player",
  },

  pt: {
    checkout: "Checkout",
    paymentDetails: "Detalhes do Pagamento",
    cardName: "Nome do Titular",
    cardNumber: "Número do Cartão",
    expiryMonth: "Mês",
    expiryYear: "Ano",
    cvv: "CVV",
    payNow: "Pagar Agora",
    processing: "Processando...",
    success: "Pagamento Bem-sucedido",
    summary: "Resumo da Assinatura",
    package: "Pacote",
    photos: "Fotos",
    videos: "Vídeos",
    ads: "Anúncios",
    remainingDays: "Dias Restantes",
    noPackage: "Nenhuma Assinatura Encontrada",
    paymentError: "Erro no Pagamento",
    securePayment: "Pagamento Seguro",

    BASIC: "Básico",
    PROFESSIONAL: "Profissional",
    PREMIUM: "Jogador Premium",
  },

  zh: {
    checkout: "结账",
    paymentDetails: "付款详情",
    cardName: "持卡人姓名",
    cardNumber: "卡号",
    expiryMonth: "月份",
    expiryYear: "年份",
    cvv: "CVV",
    payNow: "立即支付",
    processing: "处理中...",
    success: "支付成功",
    summary: "订阅摘要",
    package: "套餐",
    photos: "照片",
    videos: "视频",
    ads: "广告",
    remainingDays: "剩余天数",
    noPackage: "未找到订阅",
    paymentError: "支付错误",
    securePayment: "安全支付",

    BASIC: "基础",
    PROFESSIONAL: "专业",
    PREMIUM: "高级玩家",
  },
};

export default function CheckoutPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

  // =========================
  // FIX HYDRATION ERROR
  // =========================
  const [isClient, setIsClient] = useState(false);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setIsClient(true);
    const storedLang = localStorage.getItem("lang") || "en";
    setLang(storedLang);
  }, []);

  const t = isClient ? translations[lang] || translations.en : translations.en;

  // =========================
  // STATES
  // =========================
  const [subscriptions, setSubscriptions] = useState<
    SubscriptionType[]
  >([]);

  const [selectedPackage, setSelectedPackage] =
    useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");

  const [cardData, setCardData] = useState({
    cardholder_name: "",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  // =========================
  // GET SUBSCRIPTIONS
  // =========================
  const fetchSubscriptions = async () => {
    const res: any = await fetchGraphQL(`
      query {
        mySubscriptions {
          id
          is_active
          remaining_days

          package {
            max_photos
            max_videos
            max_ads
          }
        }
      }
    `);

    setSubscriptions(res?.data?.mySubscriptions || []);
  };

  // =========================
  // LOAD PACKAGE
  // =========================
  useEffect(() => {
    if (isClient) {
      fetchSubscriptions();

      const stored =
        localStorage.getItem("selectedPackage");

      if (stored) {
        setSelectedPackage(JSON.parse(stored));
      }
    }
  }, [isClient]);

  // =========================
  // PACKAGE LABEL
  // =========================
  const packageLabel = (type: string) => {
    switch (type) {
      case "PLAYER_BASIC":
        return t.BASIC;

      case "PLAYER_PROFESSIONAL":
        return t.PROFESSIONAL;

      case "PLAYER_PREMIUM":
        return t.PREMIUM;

      default:
        return type;
    }
  };

  // =========================
  // PAYMENT
  // =========================
  const handlePayment = async () => {
    try {
      setLoading(true);

      setError("");

      const activeSubscription = subscriptions.find(
        (s) => s.is_active
      );

      if (activeSubscription) {
        toast.success(
          lang === "ar"
            ? "تم الدفع بالفعل من قبل"
            : "You already purchased a package"
        );

        router.push("/profile");

        return;
      }

      const stored =
        localStorage.getItem("selectedPackage");

      if (!stored) {
        setError(t.noPackage);
        return;
      }

      const parsed = JSON.parse(stored);

      const allowedEnums = [
        "PLAYER_BASIC",
        "PLAYER_PROFESSIONAL",
        "PLAYER_PREMIUM",
      ];

      const enumValue = allowedEnums.includes(
        parsed.package_type
      )
        ? parsed.package_type
        : "PLAYER_BASIC";

      const res: any = await fetchGraphQL(
        `
        mutation PurchasePackage($input: PurchasePackageInput!) {
          purchasePlayerPackage(input: $input) {
            success
            message
            subscription_id
            redirect_url
          }
        }
      `,
        {
          input: {
            package_type: enumValue,

            card: {
              cardholder_name:
                cardData.cardholder_name,

              card_number:
                cardData.card_number,

              expiry_month: Number(
                cardData.expiry_month
              ),

              expiry_year: Number(
                cardData.expiry_year
              ),

              cvv: cardData.cvv,
            },
          },
        }
      );

      if (
        res?.data?.purchasePlayerPackage?.success
      ) {
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          has_active_subscription: true,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        window.dispatchEvent(
          new Event("user-updated")
        );

        setSuccess(true);

        fetchSubscriptions();

        toast.success(
          lang === "ar"
            ? "تم الدفع بنجاح"
            : "Payment successful"
        );

        const postPaymentRedirect = (role: string) => {
          switch (role) {
            case "PLAYER":
              return "/profile/player";
            case "CLUB":
              return "/clubprofile";
            case "SCOUT":
              return "/scout";
            case "AGENT":
              return "/agent";
            case "USER":
              return "/user";
            default:
              return "/profile/player";
          }
        };

        setTimeout(() => {
          router.push(postPaymentRedirect(updatedUser.role));
        }, 2000);
      } else {
        toast.error(
          res?.errors?.[0]?.message ||
            res?.data?.purchasePlayerPackage
              ?.message ||
            t.paymentError
        );

        setError(
          res?.errors?.[0]?.message ||
            res?.data?.purchasePlayerPackage
              ?.message ||
            t.paymentError
        );
      }
    } catch (err) {
      console.log(err);

      toast.error(t.paymentError);

      setError(t.paymentError);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ACTIVE SUB
  // =========================
  const activeSub = subscriptions.find(
    (s) => s.is_active
  );

  // =========================
  // LOADING STATE (PREVENT HYDRATION ERROR)
  // =========================
  if (!isClient) {
    return (
      <div
        className={`min-h-screen py-32 px-4 ${
          isDark
            ? "bg-[#07111f]"
            : "bg-[#edf4ff]"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-yellow-400/20 animate-pulse"></div>
              <div>
                <div className="h-14 w-48 bg-yellow-400/20 rounded-2xl animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-600/20 rounded-lg mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-[35px] border p-8 bg-[#0b1730]/50">
                <div className="h-10 w-48 bg-gray-600/20 rounded-2xl animate-pulse mb-8"></div>
                <div className="grid grid-cols-2 gap-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-14 rounded-2xl bg-gray-600/20 animate-pulse ${
                        i === 5 ? "col-span-2" : ""
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="w-full h-16 mt-10 bg-yellow-400/20 rounded-2xl animate-pulse"></div>
              </div>
            </div>
            <div className="rounded-[35px] border p-8 bg-[#0b1730]/50">
              <div className="h-10 w-40 bg-gray-600/20 rounded-2xl animate-pulse mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-full bg-gray-600/20 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // MAIN RENDER
  // =========================
  return (
    <div
      className={`min-h-screen py-32 px-4 ${
        isDark
          ? "bg-[#07111f] text-white"
          : "bg-[#edf4ff] text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-14">

          <div className="flex items-center gap-5">

            <div className="w-20 h-20 rounded-3xl bg-yellow-400 flex items-center justify-center">
              <Sparkles
                className="text-black"
                size={36}
              />
            </div>

            <div>
              <h1 className="text-5xl font-black text-yellow-400">
                {t.checkout}
              </h1>

              <p className="text-gray-400 mt-2">
                {t.securePayment}
              </p>
            </div>

          </div>

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-2">

            <div
              className={`rounded-[35px] border p-8 ${
                isDark
                  ? "bg-[#0b1730]"
                  : "bg-white"
              }`}
            >

              <h2 className="text-3xl font-black mb-8">
                {t.paymentDetails}
              </h2>

              {/* INPUTS */}
              <div className="grid grid-cols-2 gap-5">

                <Input
                  placeholder={t.cardName}
                  value={
                    cardData.cardholder_name
                  }
                  onChange={(e: any) =>
                    setCardData({
                      ...cardData,
                      cardholder_name:
                        e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t.cardNumber}
                  value={cardData.card_number}
                  onChange={(e: any) =>
                    setCardData({
                      ...cardData,
                      card_number:
                        e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t.expiryMonth}
                  value={
                    cardData.expiry_month
                  }
                  onChange={(e: any) =>
                    setCardData({
                      ...cardData,
                      expiry_month:
                        e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t.expiryYear}
                  value={
                    cardData.expiry_year
                  }
                  onChange={(e: any) =>
                    setCardData({
                      ...cardData,
                      expiry_year:
                        e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <div className="col-span-2">

                  <Input
                    placeholder={t.cvv}
                    value={cardData.cvv}
                    onChange={(e: any) =>
                      setCardData({
                        ...cardData,
                        cvv: e.target.value,
                      })
                    }
                    isDark={isDark}
                  />

                </div>

              </div>

              {/* BUTTON */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-16 mt-10 bg-yellow-400 text-black font-black rounded-2xl hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t.processing
                  : t.payNow}
              </button>

              {error && (
                <p className="text-red-500 mt-4">
                  {error}
                </p>
              )}

            </div>

          </div>

          {/* RIGHT */}
          <div
            className={`rounded-[35px] border p-8 ${
              isDark
                ? "bg-[#0b1730]"
                : "bg-white"
            }`}
          >

            <h2 className="text-3xl font-black mb-6">
              {t.summary}
            </h2>

            {selectedPackage ? (
              <div className="space-y-4">

                <p>
                  📦 {t.package}:{" "}
                  {
                    selectedPackage.package_label
                  }
                </p>

                <p>
                  📷 {t.photos}:{" "}
                  {
                    selectedPackage.max_photos
                  }
                </p>

                <p>
                  🎥 {t.videos}:{" "}
                  {
                    selectedPackage.max_videos
                  }
                </p>

                <p>
                  📢 {t.ads}:{" "}
                  {selectedPackage.max_ads}
                </p>

                {activeSub && (
                  <p>
                    ⏳ {t.remainingDays}:{" "}
                    {
                      activeSub.remaining_days
                    }
                  </p>
                )}

              </div>
            ) : (
              <p className="text-gray-400">
                {t.noPackage}
              </p>
            )}

          </div>

        </div>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

          <div className="bg-white text-black p-10 rounded-2xl relative max-w-md w-full mx-4">

            <button
              onClick={() =>
                setSuccess(false)
              }
              className="absolute top-3 right-3 hover:bg-gray-100 p-2 rounded-full transition-all"
            >
              <X />
            </button>

            <CheckCircle2
              className="text-green-500 mx-auto"
              size={60}
            />

            <h2 className="text-2xl font-bold mt-4 text-center">
              {t.success}
            </h2>

          </div>

        </div>
      )}

    </div>
  );
}

// =========================
// INPUT
// =========================
function Input({
  placeholder,
  value,
  onChange,
  isDark,
}: any) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full h-14 px-5 rounded-2xl border ${
        isDark
          ? "bg-[#111c33] text-white border-gray-700 focus:border-yellow-400 focus:outline-none"
          : "bg-white text-black border-gray-300 focus:border-yellow-400 focus:outline-none"
      }`}
    />
  );
}