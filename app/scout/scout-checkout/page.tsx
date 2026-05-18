"use client";

import React, { useState } from "react";

import {
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Crown,
  Star,
  Search,
  Megaphone,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";

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

    ads: "الإعلانات",

    unlimited: "طلبات غير محدودة",

    specialPlayers:
      "الوصول للاعبين المميزين",

    requestStars: "نجوم الطلبات",

    priority: "أولوية الظهور",

    noPackage: "لا يوجد اشتراك",

    paymentError:
      "حدث خطأ أثناء الدفع",

    securePayment:
      "دفع آمن ومشفر",

    yes: "متاح",
    no: "غير متاح",

    BASIC: "كشاف مبتدئ",

    PREMIUM: "كشاف محترف",
  },

  en: {
    checkout: "Checkout",

    paymentDetails:
      "Payment Details",

    cardName:
      "Card Holder Name",

    cardNumber: "Card Number",

    expiryMonth: "Month",

    expiryYear: "Year",

    cvv: "CVV",

    payNow: "Pay Now",

    processing: "Processing...",

    success:
      "Payment Successful",

    summary:
      "Subscription Summary",

    package: "Package",

    ads: "Ads",

    unlimited:
      "Unlimited Requests",

    specialPlayers:
      "Special Players Access",

    requestStars:
      "Request Stars",

    priority:
      "Priority Listing",

    noPackage:
      "No Subscription Found",

    paymentError:
      "Payment Error",

    securePayment:
      "Secure Payment",

    yes: "Available",
    no: "Unavailable",

    BASIC: "Scout Basic",

    PREMIUM: "Scout Premium",
  },
};

export default function ScoutCheckoutPage() {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const lang =
    typeof window !== "undefined"
      ? localStorage.getItem("lang") ||
        "en"
      : "en";

  const t =
    translations[lang] ||
    translations.en;

  // =========================
  // STATES
  // =========================
  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const [cardData, setCardData] =
    useState({
      cardholder_name: "",
      card_number: "",
      expiry_month: "",
      expiry_year: "",
      cvv: "",
    });

  // =========================
  // PACKAGE
  // =========================
  const selectedPackage =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem(
            "selectedScoutPackage"
          ) || "null"
        )
      : null;

  // =========================
  // LABEL
  // =========================
  const packageLabel = (
    type: string
  ) => {
    switch (type) {
      case "SCOUT_BASIC":
        return t.BASIC;

      case "SCOUT_PREMIUM":
        return t.PREMIUM;

      default:
        return type;
    }
  };

  // =========================
  // PAYMENT
  // =========================
  const handlePayment =
    async () => {
      try {
        setLoading(true);

        setError("");

        const stored =
          localStorage.getItem(
            "selectedScoutPackage"
          );

        if (!stored) {
          setError(t.noPackage);
          return;
        }

        const parsed =
          JSON.parse(stored);

        console.log(
          "SCOUT PACKAGE:",
          parsed
        );

     let enumValue =
  parsed.package_type;

// تحويل الاسم للـ ENUM الحقيقي
if (
  enumValue === "Basic Scout" ||
  enumValue === "كشاف مبتدئ"
) {
  enumValue = "SCOUT_BASIC";
}

if (
  enumValue === "Premium Scout" ||
  enumValue === "كشاف محترف"
) {
  enumValue = "SCOUT_PREMIUM";
}

console.log(
  "ENUM SENT:",
  enumValue
);

        const res: any =
          await fetchGraphQL(
            `
          mutation PurchaseOrganizationPackage(
            $input: PurchaseOrganizationPackageInput!
          ) {
            purchaseOrganizationPackage(
              input: $input
            )
          }
        `,
            {
              input: {
                package_type:
                  enumValue,

                card: {
                  cardholder_name:
                    cardData.cardholder_name,

                  card_number:
                    cardData.card_number,

                  expiry_month:
                    Number(
                      cardData.expiry_month
                    ),

                  expiry_year:
                    Number(
                      cardData.expiry_year
                    ),

                  cvv: cardData.cvv,
                },
              },
            }
          );

        console.log(
          "PAYMENT RESPONSE:",
          JSON.stringify(
            res,
            null,
            2
          )
        );

        if (
          res?.data
            ?.purchaseOrganizationPackage
        ) {
          setSuccess(true);
        } else {
          setError(
            res?.errors?.[0]
              ?.message ||
              t.paymentError
          );
        }
      } catch (err) {
        console.log(err);

        setError(t.paymentError);
      } finally {
        setLoading(false);
      }
    };

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

              <ShieldCheck
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
                  placeholder={
                    t.cardName
                  }
                  value={
                    cardData.cardholder_name
                  }
                  onChange={(
                    e: any
                  ) =>
                    setCardData({
                      ...cardData,
                      cardholder_name:
                        e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={
                    t.cardNumber
                  }
                  value={
                    cardData.card_number
                  }
                  onChange={(
                    e: any
                  ) =>
                    setCardData({
                      ...cardData,
                      card_number:
                        e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={
                    t.expiryMonth
                  }
                  value={
                    cardData.expiry_month
                  }
                  onChange={(
                    e: any
                  ) =>
                    setCardData({
                      ...cardData,
                      expiry_month:
                        e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={
                    t.expiryYear
                  }
                  value={
                    cardData.expiry_year
                  }
                  onChange={(
                    e: any
                  ) =>
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
                    value={
                      cardData.cvv
                    }
                    onChange={(
                      e: any
                    ) =>
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
                onClick={
                  handlePayment
                }
                disabled={loading}
                className="w-full h-16 mt-10 bg-yellow-400 text-black font-black rounded-2xl"
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
                  👑 {t.package}:{" "}
                  {packageLabel(
                    selectedPackage.package_type
                  )}
                </p>

                <p>
                  📢 {t.ads}:{" "}
                  {
                    selectedPackage.max_ads
                  }
                </p>

                <p>
                  🔍 {t.unlimited}:{" "}
                  {selectedPackage.can_send_unlimited
                    ? t.yes
                    : t.no}
                </p>

                <p>
                  ⭐{" "}
                  {
                    t.specialPlayers
                  }
                  :{" "}
                  {selectedPackage.can_access_special_players
                    ? t.yes
                    : t.no}
                </p>

                <p>
                  🌟{" "}
                  {
                    selectedPackage.max_request_stars
                  }{" "}
                  {
                    t.requestStars
                  }
                </p>

                <p>
                  👑 {t.priority}:{" "}
                  {selectedPackage.priority_listing
                    ? t.yes
                    : t.no}
                </p>

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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">

          <div className="bg-white text-black p-10 rounded-2xl relative">

            <button
              onClick={() =>
                setSuccess(false)
              }
              className="absolute top-3 right-3"
            >

              <X />

            </button>

            <CheckCircle2
              className="text-green-500 mx-auto"
              size={60}
            />

            <h2 className="text-2xl font-bold mt-4">

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
          ? "bg-[#111c33] text-white"
          : "bg-white"
      }`}
    />
  );
}