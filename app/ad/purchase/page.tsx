"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { useTheme } from "@/app/context/ThemeContext";

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
  };

  errors?: {
    message: string;
  }[];
}

export default function PurchaseAdPage() {
  const router = useRouter();

  const { theme } = useTheme();

  const [selectedDuration, setSelectedDuration] =
    useState<Duration | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const [cardData, setCardData] = useState({
    cardholder_name: "",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  const handlePurchase = async () => {
    if (!selectedDuration) {
      toast.error("Please select duration");
      return;
    }

    try {
      setIsProcessing(true);

      const result = (await fetchGraphQL(
        `
        mutation PurchaseAdWithDuration($input: PurchaseAdWithDurationInput!) {
          purchaseAdWithDuration(input: $input) {
            success
            purchase_id
          }
        }
        `,
        {
          input: {
            ad_duration_pricing_id: selectedDuration.id,
            card: cardData,
          },
        }
      )) as PurchaseResponse;

      if (result?.errors) {
        toast.error(result.errors[0].message);
        return;
      }

      if (result?.data?.purchaseAdWithDuration?.success) {
        toast.success(
          `Ad slot purchased successfully! (${selectedDuration.days} days)`
        );

        router.push("/profile/share");
      }
    } catch (error) {
      console.error(error);
      toast.error("Purchase failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-32 px-6 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#001a4d] text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className={`text-3xl font-bold text-center mb-8 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Purchase Ad Slot
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
            Select Duration
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
                  You are about to purchase a{" "}
                  <strong>{selectedDuration.days}-day</strong> ad slot for{" "}
                  <strong>${selectedDuration.price}</strong>
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
