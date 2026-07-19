"use client";

import React, { useState, useEffect } from "react";

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
import { useRouter } from "next/navigation";
import useTranslate from "@/app/hooks/useTranslate";

export default function ScoutCheckoutPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const router = useRouter();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [cardData, setCardData] = useState({
    cardholder_name: "",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("selectedScoutPackage");
    if (stored) {
      try {
        setSelectedPackage(JSON.parse(stored));
      } catch {
        setSelectedPackage(null);
      }
    }
  }, []);

  const packageLabel = (type: string) => {
    switch (type) {
      case "SCOUT_BASIC":
        return t("Scout Basic");
      case "SCOUT_PREMIUM":
        return t("Scout Premium");
      default:
        return type;
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      const stored = localStorage.getItem("selectedScoutPackage");

      if (!stored) {
        setError(t("No Subscription Found"));
        return;
      }

      const parsed = JSON.parse(stored);
      console.log("SCOUT PACKAGE:", parsed);

      let enumValue = parsed.package_type;

      const enumMap: Record<string, string> = {
        SCOUT_BASIC: "SCOUT_BASIC",
        SCOUT_PREMIUM: "SCOUT_PREMIUM",
        "Basic Scout": "SCOUT_BASIC",
        "Premium Scout": "SCOUT_PREMIUM",
        "كشاف مبتدئ": "SCOUT_BASIC",
        "كشاف محترف": "SCOUT_PREMIUM",
        "كشاف مميز": "SCOUT_PREMIUM",
        "Scout Basic": "SCOUT_BASIC",
        "Scout Premium": "SCOUT_PREMIUM",
        Basic: "SCOUT_BASIC",
        Premium: "SCOUT_PREMIUM",
      };

      enumValue = enumMap[enumValue] || enumValue;

      console.log("ENUM SENT:", enumValue);

      const validEnums = ["SCOUT_BASIC", "SCOUT_PREMIUM"];
      if (!validEnums.includes(enumValue)) {
        setError(
          `Invalid package type: ${enumValue}. Must be SCOUT_BASIC or SCOUT_PREMIUM`,
        );
        return;
      }

      const res: any = await fetchGraphQL(
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
            package_type: enumValue,
            card: {
              cardholder_name: cardData.cardholder_name,
              card_number: cardData.card_number,
              expiry_month: Number(cardData.expiry_month),
              expiry_year: Number(cardData.expiry_year),
              cvv: cardData.cvv,
            },
          },
        },
      );

      console.log("PAYMENT RESPONSE:", JSON.stringify(res, null, 2));

      if (res?.data?.purchaseOrganizationPackage) {
        const oldUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...oldUser,
          has_active_subscription: true,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user-updated"));

        setSuccess(true);
        localStorage.removeItem("selectedScoutPackage");

        setTimeout(() => {
          router.push("/scout/profile");
        }, 1500);
      } else {
        setError(res?.errors?.[0]?.message || t("Payment Error"));
      }
    } catch (err) {
      console.log(err);
      setError(t("Payment Error"));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div
        className={`min-h-screen py-32 px-4 ${
          isDark ? "bg-[#07111f]" : "bg-[#edf4ff]"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-32 px-4 ${
        isDark ? "bg-[#07111f] text-white" : "bg-[#edf4ff] text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-yellow-400 flex items-center justify-center">
              <ShieldCheck className="text-black" size={36} />
            </div>
            <div>
              <h1 className="text-5xl font-black text-yellow-400">
                {t("Checkout")}
              </h1>
              <p className="text-gray-400 mt-2">{t("Secure Payment")}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div
              className={`rounded-[35px] border p-8 ${
                isDark ? "bg-[#0b1730]" : "bg-white"
              }`}
            >
              <h2 className="text-3xl font-black mb-8">
                {t("Payment Details")}
              </h2>

              <div className="grid grid-cols-2 gap-5">
                <Input
                  placeholder={t("Card Holder Name")}
                  value={cardData.cardholder_name}
                  onChange={(e: any) =>
                    setCardData({
                      ...cardData,
                      cardholder_name: e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t("Card Number")}
                  value={cardData.card_number}
                  onChange={(e: any) =>
                    setCardData({
                      ...cardData,
                      card_number: e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t("Month")}
                  value={cardData.expiry_month}
                  onChange={(e: any) =>
                    setCardData({
                      ...cardData,
                      expiry_month: e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t("Year")}
                  value={cardData.expiry_year}
                  onChange={(e: any) =>
                    setCardData({
                      ...cardData,
                      expiry_year: e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <div className="col-span-2">
                  <Input
                    placeholder={t("CVV")}
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

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-16 mt-10 bg-yellow-400 text-black font-black rounded-2xl hover:bg-yellow-500 transition disabled:opacity-50"
              >
                {loading ? t("Processing...") : t("Pay Now")}
              </button>

              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
          </div>

          <div
            className={`rounded-[35px] border p-8 ${
              isDark ? "bg-[#0b1730]" : "bg-white"
            }`}
          >
            <h2 className="text-3xl font-black mb-6">
              {t("Subscription Summary")}
            </h2>

            {selectedPackage ? (
              <div className="space-y-4">
                <p>
                  👑 {t("Package")}:{" "}
                  {packageLabel(selectedPackage.package_type)}
                </p>
                <p>
                  📢 {t("Ads")}: {selectedPackage.max_ads}
                </p>
                <p>
                  🔍 {t("Unlimited Requests")}:{" "}
                  {selectedPackage.can_send_unlimited
                    ? t("Available")
                    : t("Unavailable")}
                </p>
                <p>
                  ⭐ {t("Special Players Access")}:{" "}
                  {selectedPackage.can_access_special_players
                    ? t("Available")
                    : t("Unavailable")}
                </p>
                <p>
                  🌟 {selectedPackage.max_request_stars} {t("Request Stars")}
                </p>
                <p>
                  👑 {t("Priority Listing")}:{" "}
                  {selectedPackage.priority_listing
                    ? t("Available")
                    : t("Unavailable")}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">{t("No Subscription Found")}</p>
            )}
          </div>
        </div>
      </div>

      {success && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white text-black p-10 rounded-2xl relative">
            <button
              onClick={() => setSuccess(false)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>
            <CheckCircle2 className="text-green-500 mx-auto" size={60} />
            <h2 className="text-2xl font-bold mt-4">
              {t("Payment Successful")}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ placeholder, value, onChange, isDark }: any) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full h-14 px-5 rounded-2xl border ${
        isDark ? "bg-[#111c33] text-white" : "bg-white"
      }`}
    />
  );
}
