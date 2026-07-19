"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

// =========================
// NORMALIZE
// =========================
const normalizePackageType = (type: string) => {
  const v = (type || "").toLowerCase();

  if (
    v.includes("agent") ||
    v.includes("وكيل") ||
    v.includes("agente") ||
    v.includes("básico") ||
    v.includes("basico")
  ) {
    return "AGENT_BASIC";
  }

  return "AGENT_BASIC";
};

// =========================
// PAGE
// =========================
export default function AgentCheckoutPage() {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const router = useRouter();

  const isDark = theme === "dark";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [card, setCard] = useState({
    cardholder_name: "",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  // =========================
  // LOAD PACKAGE
  // =========================
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("selectedPackage");

    if (stored) {
      setSelectedPackage(JSON.parse(stored));
    }
  }, []);

  // =========================
  // PAYMENT
  // =========================
  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      if (!selectedPackage) {
        setError(t("No Package Selected"));
        return;
      }

      const enumValue = normalizePackageType(
        selectedPackage.package_type
      );

      const res: any = await fetchGraphQL(
        `
        mutation PurchaseOrganizationPackage($input: PurchaseOrganizationPackageInput!) {
          purchaseOrganizationPackage(input: $input)
        }
        `,
        {
          input: {
            package_type: enumValue,

            card: {
              cardholder_name: card.cardholder_name,
              card_number: card.card_number,
              expiry_month: Number(card.expiry_month),
              expiry_year: Number(card.expiry_year),
              cvv: card.cvv,
            },
          },
        }
      );

      console.log("PAYMENT:", res);

      if (!res?.errors) {
        setSuccess(true);

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

        setTimeout(() => {
          router.push("/agent/profile");
        }, 1500);
      } else {
        setError(res?.errors?.[0]?.message);
      }
    } catch (err) {
      setError(t("Payment Error"));
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div
        className={`min-h-screen py-28 px-4 ${
          isDark ? "bg-[#0b1120]" : "bg-[#eef4ff]"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-30 px-4 ${
        isDark
          ? "bg-[#0b1120] text-white"
          : "bg-[#eef4ff] text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-14">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-yellow-400 flex items-center justify-center">
              <ShieldCheck className="text-black" size={36} />
            </div>
            <div>
              <h1 className="text-5xl font-black text-yellow-400">
                {t("Agent Checkout")}
              </h1>
              <p className="text-gray-400 mt-2">{t("Secure Payment")}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT - FORM */}
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
                  value={card.cardholder_name}
                  onChange={(e: any) =>
                    setCard({
                      ...card,
                      cardholder_name: e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t("Card Number")}
                  value={card.card_number}
                  onChange={(e: any) =>
                    setCard({
                      ...card,
                      card_number: e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t("Month")}
                  value={card.expiry_month}
                  onChange={(e: any) =>
                    setCard({
                      ...card,
                      expiry_month: e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <Input
                  placeholder={t("Year")}
                  value={card.expiry_year}
                  onChange={(e: any) =>
                    setCard({
                      ...card,
                      expiry_year: e.target.value,
                    })
                  }
                  isDark={isDark}
                />

                <div className="col-span-2">
                  <Input
                    placeholder={t("CVV")}
                    value={card.cvv}
                    onChange={(e: any) =>
                      setCard({
                        ...card,
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

          {/* RIGHT - SUMMARY */}
          <div
            className={`rounded-[35px] border p-8 ${
              isDark ? "bg-[#0b1730]" : "bg-white"
            }`}
          >
            <h2 className="text-3xl font-black mb-6">
              {t("Package Summary")}
            </h2>

            {selectedPackage ? (
              <div className="space-y-4">
                <p>
                  📦 {t("Package")}: <span className="text-yellow-400 font-bold">{t(selectedPackage.package_type)}</span>
                </p>
                <p>
                  💰 {t("Price")}: ${selectedPackage.price}
                </p>
                <p>
                  📢 {t("Ads")}: {selectedPackage.max_ads}
                </p>
              </div>
            ) : (
              <p className="text-gray-400">{t("No Package Selected")}</p>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {success && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white text-black p-10 rounded-2xl relative">
            <button
              onClick={() => setSuccess(false)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>
            <CheckCircle2
              className="text-green-500 mx-auto"
              size={60}
            />
            <h2 className="text-2xl font-bold mt-4">
              {t("Payment Successful")}
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
        isDark ? "bg-[#111c33] text-white" : "bg-white"
      }`}
    />
  );
}