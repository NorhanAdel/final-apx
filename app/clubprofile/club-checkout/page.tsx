"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Sparkles,
  X,
  Megaphone,
  Shield,
  Star,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";

 

import { useTheme } from "../../context/ThemeContext";

import { fetchGraphQL } from "../../lib/fetchGraphQL";

// =========================
// TYPES
// =========================
type OrganizationSubscriptionType =
  {
    id: string;

    is_active: boolean;

    remaining_days: number;

    max_ads: number;

    ads_used: number;

    ads_remaining: number;

    started_at: string;

    expires_at: string;

    auto_renew: boolean;
  };

// =========================
// TRANSLATIONS
// =========================
const translations: any = {
  ar: {
    checkout: "الدفع",

    paymentDetails:
      "بيانات الدفع",

    cardName:
      "اسم صاحب البطاقة",

    cardNumber:
      "رقم البطاقة",

    expiryMonth: "الشهر",

    expiryYear: "السنة",

    cvv: "CVV",

    payNow: "ادفع الآن",

    processing:
      "جارى الدفع...",

    success:
      "تم الدفع بنجاح",

    summary:
      "ملخص الاشتراك",

    package: "الباقة",

    ads: "الإعلانات",

    remainingDays:
      "الأيام المتبقية",

    noPackage:
      "لا يوجد اشتراك",

    paymentError:
      "حدث خطأ أثناء الدفع",

    securePayment:
      "دفع آمن ومشفر",

    unlimitedSend:
      "إرسال غير محدود",

    limitedSend:
      "إرسال محدود",

    specialPlayers:
      "الوصول للاعبين المميزين",

    normalPlayers:
      "وصول عادي",

    stars: "عدد النجوم",

    priority:
      "أولوية الظهور",

    noPriority:
      "بدون أولوية",

    BASIC: "أساسي",

    PREMIUM: "محترف",
  },

  en: {
    checkout: "Checkout",

    paymentDetails:
      "Payment Details",

    cardName:
      "Card Holder Name",

    cardNumber:
      "Card Number",

    expiryMonth: "Month",

    expiryYear: "Year",

    cvv: "CVV",

    payNow: "Pay Now",

    processing:
      "Processing...",

    success:
      "Payment Successful",

    summary:
      "Subscription Summary",

    package: "Package",

    ads: "Ads",

    remainingDays:
      "Remaining Days",

    noPackage:
      "No Subscription Found",

    paymentError:
      "Payment Error",

    securePayment:
      "Secure Payment",

    unlimitedSend:
      "Unlimited Requests",

    limitedSend:
      "Limited Requests",

    specialPlayers:
      "Special Players Access",

    normalPlayers:
      "Normal Access",

    stars: "Request Stars",

    priority:
      "Priority Listing",

    noPriority:
      "No Priority",

    BASIC: "Basic",

    PREMIUM: "Premium",
  },
};

export default function OrganizationCheckoutPage() {

  const { theme } = useTheme();
const router = useRouter();
  const isDark =
    theme === "dark";

  const lang =
    typeof window !==
    "undefined"
      ? localStorage.getItem(
          "lang"
        ) || "en"
      : "en";

  const t =
    translations[lang] ||
    translations.en;

  // =========================
  // STATES
  // =========================
  const [
    subscriptions,
    setSubscriptions,
  ] = useState<
    OrganizationSubscriptionType[]
  >([]);

  const [
    selectedPackage,
    setSelectedPackage,
  ] = useState<any>(null);

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
  // GET SUBSCRIPTIONS
  // =========================
  const fetchSubscriptions =
    async () => {

      const res: any =
        await fetchGraphQL(`
        query {
          mySubscriptions {
            id

            is_active

            remaining_days

            max_ads

            ads_used

            ads_remaining

            started_at

            expires_at

            auto_renew
          }
        }
      `);

      setSubscriptions(
        res?.data
          ?.mySubscriptions || []
      );
    };

  // =========================
  // LOAD PACKAGE
  // =========================
  useEffect(() => {

    fetchSubscriptions();

    const stored =
      localStorage.getItem(
        "selectedOrganizationPackage"
      );

    if (stored) {

      const parsed =
        JSON.parse(stored);

      console.log(
        "ORGANIZATION PACKAGE:",
        parsed
      );

      setSelectedPackage(parsed);
    }

  }, []);

  // =========================
  // PACKAGE LABEL
  // =========================
  const packageLabel = (
    type: string
  ) => {

    switch (type) {

      case "SCOUT_BASIC":
      case "CLUB_BASIC":
        return t.BASIC;

      case "SCOUT_PREMIUM":
      case "CLUB_PREMIUM":
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
            "selectedOrganizationPackage"
          );

        if (!stored) {

          setError(
            t.noPackage
          );

          return;
        }

        const parsed =
          JSON.parse(stored);

        console.log(
          "ORGANIZATION PACKAGE:",
          parsed
        );

        let enumValue =
          parsed.package_type;

        // =========================
        // ENUM FIX
        // =========================
        if (
          enumValue ===
            "Basic Scout" ||
          enumValue ===
            "كشاف أساسي"
        ) {
          enumValue =
            "SCOUT_BASIC";
        }

        if (
          enumValue ===
            "Premium Scout" ||
          enumValue ===
            "كشاف محترف"
        ) {
          enumValue =
            "SCOUT_PREMIUM";
        }

        if (
          enumValue ===
            "Basic Club" ||
          enumValue ===
            "نادي أساسي"
        ) {
          enumValue =
            "CLUB_BASIC";
        }

        if (
          enumValue ===
            "Premium Club" ||
          enumValue ===
            "نادي محترف"
        ) {
          enumValue =
            "CLUB_PREMIUM";
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

                  cvv:
                    cardData.cvv,
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

       if (!res?.errors) {

  setSuccess(true);

  fetchSubscriptions();

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  currentUser.has_active_subscription = true;

  localStorage.setItem(
    "user",
    JSON.stringify(currentUser)
  );

  window.dispatchEvent(
    new Event("user-updated")
  );

  setTimeout(() => {
    router.push("/clubprofile/profile");
  }, 2000);

} else  {

          setError(
            res?.errors?.[0]
              ?.message ||
              t.paymentError
          );
        }

      } catch (err) {

        console.log(err);

        setError(
          t.paymentError
        );

      } finally {

        setLoading(false);

      }
    };

  // =========================
  // ACTIVE SUB
  // =========================
  const activeSub =
    subscriptions.find(
      (s) => s.is_active
    );

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
                        e.target
                          .value,
                    })
                  }
                  isDark={
                    isDark
                  }
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
                        e.target
                          .value,
                    })
                  }
                  isDark={
                    isDark
                  }
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
                        e.target
                          .value,
                    })
                  }
                  isDark={
                    isDark
                  }
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
                        e.target
                          .value,
                    })
                  }
                  isDark={
                    isDark
                  }
                />

                <div className="col-span-2">

                  <Input
                    placeholder={
                      t.cvv
                    }
                    value={
                      cardData.cvv
                    }
                    onChange={(
                      e: any
                    ) =>
                      setCardData({
                        ...cardData,

                        cvv:
                          e.target
                            .value,
                      })
                    }
                    isDark={
                      isDark
                    }
                  />

                </div>

              </div>

              {/* BUTTON */}
              <button
                onClick={
                  handlePayment
                }
                disabled={
                  loading
                }
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
                  📦{" "}
                  {t.package}:{" "}
                  {packageLabel(
                    selectedPackage.package_type
                  )}
                </p>

                <Feature
                  icon={
                    <Megaphone
                      size={18}
                    />
                  }
                  text={`${selectedPackage.max_ads} ${t.ads}`}
                />

                <Feature
                  icon={
                    <Send
                      size={18}
                    />
                  }
                  text={
                    selectedPackage.can_send_unlimited
                      ? t.unlimitedSend
                      : t.limitedSend
                  }
                />

                <Feature
                  icon={
                    <Shield
                      size={18}
                    />
                  }
                  text={
                    selectedPackage.can_access_special_players
                      ? t.specialPlayers
                      : t.normalPlayers
                  }
                />

                <Feature
                  icon={
                    <Star
                      size={18}
                    />
                  }
                  text={`${selectedPackage.max_request_stars} ${t.stars}`}
                />

                <Feature
                  icon={
                    <CheckCircle2
                      size={18}
                    />
                  }
                  text={
                    selectedPackage.priority_listing
                      ? t.priority
                      : t.noPriority
                  }
                />

                {activeSub && (
                  <p>
                    ⏳{" "}
                    {
                      t.remainingDays
                    }
                    :{" "}
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">

          <div className="bg-white text-black p-10 rounded-2xl relative">

            <button
              onClick={() =>
                setSuccess(
                  false
                )
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
      placeholder={
        placeholder
      }
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

// =========================
// FEATURE
// =========================
function Feature({
  text,
  icon,
}: any) {

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">

      <div className="flex items-center gap-3 text-cyan-400">

        {icon}

        <span className="text-sm font-medium">

          {text}

        </span>

      </div>

      <CheckCircle2
        size={18}
        className="text-green-400"
      />

    </div>
  );
}
