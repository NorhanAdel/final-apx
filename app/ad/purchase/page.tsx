"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/auth-context";
import useTranslate from "@/app/hooks/useTranslate";

import { AdDurationSelector } from "@/app/components/AdDurationSelector";
import { PaymentForm } from "@/app/components/PaymentForm";

interface Duration {
  id: string;
  days: number;
  price: number;
}

interface PurchaseResponse {
  data?: {
    purchaseAdWithDuration?: {
      success: boolean;
      purchase_id: string;
    };
    purchaseOrgAdWithDuration?: {
      success: boolean;
      purchase_id: string;
    };
  };

  errors?: {
    message: string;
  }[];
}

export default function PurchaseAdPage() {
  const router = useRouter();
  const { t } = useTranslate();

  const { theme } = useTheme();
  const { user } = useAuth();

  const [selectedDuration, setSelectedDuration] = useState<Duration | null>(
    null,
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const getShareAdRoute = (days: number): string => {
    const role = user?.role || "";
    
    switch (role) {
      case "PLAYER":
        return `/profile/share?days=${days}`;
      case "CLUB":
        return `/clubprofile/shareAd?days=${days}`;
      case "SCOUT":
        return `/scout/profile/share?days=${days}`;
      case "AGENT":
        return `/agent/shareAd?days=${days}`;
      default:
        return `/shareAd?days=${days}`;
    }
  };

  const handlePurchase = async (cardData: {
    cardholder_name: string;
    card_number: string;
    expiry_month: number;
    expiry_year: number;
    cvv: string;
  }) => {
    if (!selectedDuration) {
      toast.error(t("Please select duration"));
      return;
    }

    try {
      setIsProcessing(true);

      const isOrg = ["CLUB", "SCOUT", "AGENT"].includes(user?.role || "");

      const query = isOrg
        ? `
        mutation PurchaseOrgAdWithDuration($input: PurchaseOrgAdWithDurationInput!) {
          purchaseOrgAdWithDuration(input: $input) {
            success
            purchase_id
          }
        }
      `
        : `
        mutation PurchaseAdWithDuration($input: PurchaseAdWithDurationInput!) {
          purchaseAdWithDuration(input: $input) {
            success
            purchase_id
          }
        }
      `;

      const result = (await fetchGraphQL(query, {
        input: {
          ad_duration_pricing_id: selectedDuration.id,
          card: {
            cardholder_name: cardData.cardholder_name,
            card_number: cardData.card_number,
            expiry_month: cardData.expiry_month,
            expiry_year: cardData.expiry_year,
            cvv: cardData.cvv,
          },
        },
      })) as PurchaseResponse;

      if (result?.errors) {
        toast.error(result.errors[0].message);
        return;
      }

      const success = isOrg
        ? result?.data?.purchaseOrgAdWithDuration?.success
        : result?.data?.purchaseAdWithDuration?.success;

      if (success) {
        toast.success(
          `${t("Ad slot purchased successfully!")} (${
            selectedDuration.days
          } ${t("days")})`,
        );

        window.dispatchEvent(new Event("ad-purchased"));

        const shareAdRoute = getShareAdRoute(selectedDuration.days);
        router.push(shareAdRoute);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("Purchase failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-32 px-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-[#020617] text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className={`text-3xl font-bold text-center mb-8 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {t("Purchase Ad Slot")}
        </h1>

        <div
          className={`rounded-2xl p-6 shadow-lg border transition-colors duration-300 ${
            theme === "dark"
              ? "bg-gray-900 border-white/10"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {t("Select Duration")}
          </h2>

          <AdDurationSelector
            selectedId={selectedDuration?.id}
            onSelect={setSelectedDuration}
          />

          {selectedDuration && (
            <>
              <div
                className={`my-6 p-4 rounded-xl border transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-yellow-400/10 border-yellow-400/20"
                    : "bg-yellow-100 border-yellow-300"
                }`}
              >
                <p
                  className={`text-center ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  {t("You are about to purchase a")}{" "}
                  <strong>
                    {selectedDuration.days}
                    {t("days")}
                  </strong>{" "}
                  {t("ad slot for")} <strong>${selectedDuration.price}</strong>
                </p>
              </div>

              <PaymentForm
                onSubmit={handlePurchase}
                isLoading={isProcessing}
                amount={selectedDuration.price}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}