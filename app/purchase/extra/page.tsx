"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchGraphQL } from "@/app/lib/fetchGraphQL";
import { PaymentForm } from "@/app/components/PaymentForm";
import { PURCHASE_EXTRA_ITEM } from "@/app/graphql/mutation/purchase.mutations";
import { CardData, PurchaseExtraResponse } from "@/app/types/purchase.types";


function PurchaseExtraContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") as "PHOTO" | "VIDEO";
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!type || (type !== "PHOTO" && type !== "VIDEO")) {
      toast.error("Invalid purchase type");
      router.push("/profile/imagesreels");
    }
  }, [type, router]);

  const handlePurchase = async (cardData: CardData) => {
    setIsProcessing(true);
    try {
      const result = (await fetchGraphQL(PURCHASE_EXTRA_ITEM, {
        input: {
          unit_type: type,
          quantity: 1,
          card: cardData,
        },
      })) as PurchaseExtraResponse;

      if (result?.errors) {
        toast.error(result.errors[0].message);
        return;
      }

      if (result?.data?.purchaseExtraItem?.success) {
        toast.success(
          type === "PHOTO"
            ? "Extra photo purchased successfully!"
            : "Extra video purchased successfully!",
        );
        router.push("/profile/imagesreels");
      }
    } catch (error) {
      console.error(error);
      toast.error("Purchase failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-32 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Purchase Extra {type === "PHOTO" ? "Photo" : "Video"} Slot
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="mb-6 p-4 bg-yellow-400/10 rounded-xl">
            <p className="text-center">
              You are about to purchase an extra{" "}
              <strong>{type === "PHOTO" ? "photo" : "video"}</strong> slot
            </p>
          </div>

          <PaymentForm onSubmit={handlePurchase} isLoading={isProcessing} />
        </div>
      </div>
    </div>
  );
}

export default function PurchaseExtraPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        </div>
      }
    >
      <PurchaseExtraContent />
    </Suspense>
  );
}
