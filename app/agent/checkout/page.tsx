"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";

// =========================
// TRANSLATIONS
// =========================
const t: any = {
  en: {
    checkout: "Agent Checkout",
    payment: "Payment Details",
    name: "Card Holder Name",
    number: "Card Number",
    month: "Month",
    year: "Year",
    cvv: "CVV",
    pay: "Pay Now",
    processing: "Processing...",
    success: "Payment Successful",
    summary: "Package Summary",
    noPackage: "No Package Selected",
  },
};

// =========================
// NORMALIZE (IMPORTANT FIX)
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
  const router = useRouter();

  const isDark = theme === "dark";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [selectedPackage, setSelectedPackage] = useState<any>(null);

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
        setError(t.en.noPackage);
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

        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setError(res?.errors?.[0]?.message);
      }
    } catch (err) {
      setError("Payment Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-28 px-4 ${
        isDark
          ? "bg-[#0b1120] text-white"
          : "bg-[#eef4ff] text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">

        {/* LEFT - FORM */}
        <div className="bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">

          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="text-yellow-400" />
            <h1 className="text-3xl font-black">
              {t.en.checkout}
            </h1>
          </div>

          <div className="space-y-4">

            <Input
              placeholder={t.en.name}
              value={card.cardholder_name}
              onChange={(e: any) =>
                setCard({
                  ...card,
                  cardholder_name: e.target.value,
                })
              }
            />

            <Input
              placeholder={t.en.number}
              value={card.card_number}
              onChange={(e: any) =>
                setCard({
                  ...card,
                  card_number: e.target.value,
                })
              }
            />

            <div className="grid grid-cols-2 gap-4">

              <Input
                placeholder={t.en.month}
                value={card.expiry_month}
                onChange={(e: any) =>
                  setCard({
                    ...card,
                    expiry_month: e.target.value,
                  })
                }
              />

              <Input
                placeholder={t.en.year}
                value={card.expiry_year}
                onChange={(e: any) =>
                  setCard({
                    ...card,
                    expiry_year: e.target.value,
                  })
                }
              />

            </div>

            <Input
              placeholder={t.en.cvv}
              value={card.cvv}
              onChange={(e: any) =>
                setCard({
                  ...card,
                  cvv: e.target.value,
                })
              }
            />

          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-8 bg-yellow-400 text-black font-bold py-4 rounded-2xl"
          >
            {loading ? t.en.processing : t.en.pay}
          </button>

          {error && (
            <p className="text-red-400 mt-4">{error}</p>
          )}
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="bg-white/10 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">

          <h2 className="text-2xl font-black mb-6">
            {t.en.summary}
          </h2>

          {selectedPackage ? (
            <div className="space-y-4">

              <p>📦 {selectedPackage.package_type}</p>
              <p>💰 ${selectedPackage.price}</p>
              <p>📢 Ads: {selectedPackage.max_ads}</p>

            </div>
          ) : (
            <p>{t.en.noPackage}</p>
          )}

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

            <h2 className="text-xl font-bold mt-4">
              {t.en.success}
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
}: any) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full h-14 px-5 rounded-2xl bg-black/20 border border-white/10 text-white"
    />
  );
}