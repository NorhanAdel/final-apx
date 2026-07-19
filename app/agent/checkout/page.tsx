"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // ← أضف هذا السطر

import { Sparkles, CheckCircle2, X, ShieldCheck } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { fetchGraphQL } from "../../lib/fetchGraphQL";
import useTranslate from "@/app/hooks/useTranslate";

// =========================
// NORMALIZE
// =========================
const normalizePackageType = (type: string) => {
  const v = (type || "").toLowerCase();

  if (v.includes("premium") || v.includes("بريميوم")) {
    return "AGENT_PREMIUM";
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
      try {
        const parsed = JSON.parse(stored);
        setSelectedPackage(parsed);
      } catch (e) {
        console.error("Error parsing selectedPackage:", e);
      }
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

      // Validate card holder name
      if (!card.cardholder_name.trim()) {
        setError(t("Card holder name is required"));
        setLoading(false);
        return;
      }

      // Validate card number
      const cleanCardNumber = card.card_number.replace(/\s/g, "");
      if (!cleanCardNumber || cleanCardNumber.length < 16) {
        setError(t("Valid card number is required (16 digits)"));
        setLoading(false);
        return;
      }

      // Validate expiry month
      const month = parseInt(card.expiry_month);
      if (!card.expiry_month || month < 1 || month > 12) {
        setError(t("Valid expiry month is required (1-12)"));
        setLoading(false);
        return;
      }

      // Validate expiry year
      const year = parseInt(card.expiry_year);
      const currentYear = new Date().getFullYear();
      if (!card.expiry_year || year < currentYear || year > currentYear + 10) {
        setError(t("Valid expiry year is required"));
        setLoading(false);
        return;
      }

      // Check if card is expired
      const currentMonth = new Date().getMonth() + 1;
      if (year === currentYear && month < currentMonth) {
        setError(t("Card has expired"));
        setLoading(false);
        return;
      }

      // Validate CVV
      if (!card.cvv || card.cvv.length < 3) {
        setError(t("Valid CVV is required (3-4 digits)"));
        setLoading(false);
        return;
      }

      const enumValue = normalizePackageType(selectedPackage.package_type);

      // =========================
      // MUTATION - WITHOUT SELECTION
      // =========================
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
              card_number: cleanCardNumber,
              expiry_month: month,
              expiry_year: year,
              cvv: card.cvv,
            },
          },
        },
      );

      console.log("PAYMENT RESPONSE:", res);

      // =========================
      // CHECK RESPONSE (Boolean)
      // =========================
      if (res?.data?.purchaseOrganizationPackage === true) {
        setSuccess(true);

        const updatedUser = {
          ...JSON.parse(localStorage.getItem("user") || "{}"),
          has_active_subscription: true,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        window.dispatchEvent(new Event("user-updated"));

        localStorage.removeItem("selectedPackage");

        toast.success(t("Payment successful"));

        setTimeout(() => {
          router.push("/agent/profile");
        }, 1500);
      } else {
        // لو رجعت false أو null
        const errorMsg = res?.errors?.[0]?.message || t("Payment Error");
        setError(errorMsg);

        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(t("Payment Error"));
      toast.error(t("Payment Error"));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING STATE
  // =========================
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

  // =========================
  // MAIN RENDER
  // =========================
  return (
    <div
      className={`min-h-screen py-30 px-4 ${
        isDark ? "bg-[#0b1120] text-white" : "bg-[#eef4ff] text-black"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-14">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <ShieldCheck className="text-black" size={36} />
            </div>
            <div>
              <h1 className="text-5xl font-black text-yellow-400">
                {t("Agent Checkout")}
              </h1>
              <p className="text-gray-400 mt-2 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                {t("Secure Payment")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT - FORM */}
          <div className="lg:col-span-2">
            <div
              className={`rounded-[35px] border p-8 ${
                isDark
                  ? "bg-[#0b1730] border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <span>💳</span>
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
                  onChange={(e: any) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
                    setCard({
                      ...card,
                      card_number: formatted,
                    });
                  }}
                  isDark={isDark}
                  maxLength={19}
                />

                <div>
                  <Input
                    placeholder={t("Month")}
                    value={card.expiry_month}
                    onChange={(e: any) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 2) {
                        const numValue = parseInt(value);
                        if (value === "" || (numValue >= 1 && numValue <= 12)) {
                          setCard({
                            ...card,
                            expiry_month: value,
                          });
                        }
                      }
                    }}
                    isDark={isDark}
                    maxLength={2}
                    placeholder="MM"
                  />
                </div>

                <div>
                  <Input
                    placeholder={t("Year")}
                    value={card.expiry_year}
                    onChange={(e: any) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4) {
                        setCard({
                          ...card,
                          expiry_year: value,
                        });
                      }
                    }}
                    isDark={isDark}
                    maxLength={4}
                    placeholder="YYYY"
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    placeholder={t("CVV")}
                    value={card.cvv}
                    onChange={(e: any) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 4) {
                        setCard({
                          ...card,
                          cvv: value,
                        });
                      }
                    }}
                    isDark={isDark}
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full h-16 mt-10 bg-yellow-400 text-black font-black rounded-2xl transition-all ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-yellow-500 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                    {t("Processing...")}
                  </span>
                ) : (
                  t("Pay Now")
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 flex items-center gap-2">
                    <X size={18} />
                    {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT - SUMMARY */}
          <div
            className={`rounded-[35px] border p-8 ${
              isDark
                ? "bg-[#0b1730] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
              <span>📋</span>
              {t("Package Summary")}
            </h2>

            {selectedPackage ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
                  <p className="text-sm text-gray-400">{t("Package")}</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {t(selectedPackage.package_type)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-500/5 border border-gray-500/10">
                  <p className="text-sm text-gray-400">{t("Price")}</p>
                  <p className="text-2xl font-black">
                    ${selectedPackage.price}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-500/5 border border-gray-500/10">
                  <p className="text-sm text-gray-400">{t("Ads")}</p>
                  <p className="text-xl font-bold">{selectedPackage.max_ads}</p>
                </div>

                {selectedPackage.max_photos !== undefined && (
                  <div className="p-4 rounded-xl bg-gray-500/5 border border-gray-500/10">
                    <p className="text-sm text-gray-400">{t("Photos")}</p>
                    <p className="text-xl font-bold">
                      {selectedPackage.max_photos}
                    </p>
                  </div>
                )}

                {selectedPackage.max_videos !== undefined && (
                  <div className="p-4 rounded-xl bg-gray-500/5 border border-gray-500/10">
                    <p className="text-sm text-gray-400">{t("Videos")}</p>
                    <p className="text-xl font-bold">
                      {selectedPackage.max_videos}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">{t("No Package Selected")}</p>
                <button
                  onClick={() => router.push("/agent/packages")}
                  className="mt-4 text-yellow-400 hover:underline"
                >
                  {t("Browse Packages")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {success && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-10 rounded-2xl relative max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setSuccess(false)}
              className="absolute top-3 right-3 hover:bg-gray-100 p-2 rounded-full transition-all"
            >
              <X />
            </button>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-500" size={48} />
              </div>
              <h2 className="text-2xl font-bold mt-2">
                {t("Payment Successful")}
              </h2>
              <p className="text-gray-500 mt-2 text-center">
                {t("Your subscription has been activated successfully")}
              </p>
              <div className="mt-6 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full animate-pulse" />
            </div>
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
  maxLength,
  type = "text",
}: any) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      type={type}
      className={`w-full h-14 px-5 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${
        isDark
          ? "bg-[#111c33] text-white border-gray-700"
          : "bg-white text-black border-gray-300"
      }`}
    />
  );
}
