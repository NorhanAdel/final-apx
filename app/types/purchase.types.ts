export interface CardData {
  cardholder_name: string;
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
}

export interface PurchaseExtraResponse {
  data: {
    purchaseExtraItem: {
      success: boolean;
      message: string;
      purchase_id: string;
    };
  };
  errors?: Array<{ message: string }>;
}

export interface PurchaseAdResponse {
  data: {
    purchaseAdWithDuration: {
      success: boolean;
      purchase_id: string;
    };
  };
  errors?: Array<{ message: string }>;
}
