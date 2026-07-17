"use client";

import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import useTranslate from "@/app/hooks/useTranslate";

interface CardData {
  cardholder_name: string;
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
}

interface Props {
  onSubmit: (cardData: CardData) => Promise<void>;
  isLoading: boolean;
  amount?: number;
}

export function PaymentForm({ onSubmit, isLoading, amount }: Props) {
  const { t } = useTranslate();

  const [cardData, setCardData] = useState<CardData>({
    cardholder_name: "",
    card_number: "",
    expiry_month: 12,
    expiry_year: 2028,
    cvv: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(cardData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <CreditCard /> {t("Payment Details")}
        {amount && <span className="text-yellow-500">(${amount})</span>}
      </h3>

      <div>
        <label className="block text-sm mb-1">{t("Cardholder Name")}</label>
        <input
          type="text"
          required
          value={cardData.cardholder_name}
          onChange={(e) =>
            setCardData({ ...cardData, cardholder_name: e.target.value })
          }
          className="w-full p-3 rounded-xl border dark:bg-gray-700"
          placeholder={t("John Doe")}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">{t("Card Number")}</label>
        <input
          type="text"
          required
          value={cardData.card_number}
          onChange={(e) =>
            setCardData({ ...cardData, card_number: e.target.value })
          }
          className="w-full p-3 rounded-xl border dark:bg-gray-700"
          placeholder="4111 1111 1111 1111"
          maxLength={16}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">{t("Expiry Month")}</label>
          <select
            required
            value={cardData.expiry_month}
            onChange={(e) =>
              setCardData({
                ...cardData,
                expiry_month: parseInt(e.target.value),
              })
            }
            className="w-full p-3 rounded-xl border dark:bg-gray-700"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">{t("Expiry Year")}</label>
          <select
            required
            value={cardData.expiry_year}
            onChange={(e) =>
              setCardData({
                ...cardData,
                expiry_year: parseInt(e.target.value),
              })
            }
            className="w-full p-3 rounded-xl border dark:bg-gray-700"
          >
            {Array.from(
              { length: 10 },
              (_, i) => new Date().getFullYear() + i,
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">{t("CVV")}</label>
        <input
          type="text"
          required
          value={cardData.cvv}
          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
          className="w-full p-3 rounded-xl border dark:bg-gray-700"
          placeholder="123"
          maxLength={4}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-yellow-400 text-black font-bold hover:scale-105 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
        ) : (
          <>
            <Lock size={18} />
            {t("Pay Now")}
          </>
        )}
      </button>
    </form>
  );
}