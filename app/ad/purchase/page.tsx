"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { AdDurationSelector } from "@/app/components/AdDurationSelector";
import { PaymentForm } from "@/app/components/PaymentForm";

interface AdDuration {
  id: string;
  days: number;
  price: number;
}

interface CardData {
  cardholder_name: string;
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
}

interface PurchaseResponse {
  data: {
    purchaseAdWithDuration: {
      success: boolean;
      purchase_id: string;
    };
  };
  errors?: Array<{ message: string }>;
}

export default function PurchaseAdPage() {
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState<AdDuration | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (cardData: CardData) => {
    if (!selectedDuration) {
      toast.error("Please select an ad duration");
      return;
    }

    setIsProcessing(true);
    try {
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
        },
      )) as PurchaseResponse;

      if (result?.errors) {
        toast.error(result.errors[0].message);
        return;
      }

      if (result?.data?.purchaseAdWithDuration?.success) {
        toast.success(
          `Ad slot purchased successfully! (${selectedDuration.days} days)`,
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
    <div className="min-h-screen py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Purchase Ad Slot
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Select Duration</h2>
          <AdDurationSelector
            selectedId={selectedDuration?.id}
            onSelect={setSelectedDuration}
          />

          {selectedDuration && (
            <>
              <div className="my-6 p-4 bg-yellow-400/10 rounded-xl">
                <p className="text-center">
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
