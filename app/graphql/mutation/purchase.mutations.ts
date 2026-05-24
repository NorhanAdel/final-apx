export const PURCHASE_EXTRA_ITEM = `
  mutation PurchaseExtraItem($input: PurchaseExtraItemInput!) {
    purchaseExtraItem(input: $input) {
      success
      message
      purchase_id
    }
  }
`;

export const PURCHASE_AD_WITH_DURATION = `
  mutation PurchaseAdWithDuration($input: PurchaseAdWithDurationInput!) {
    purchaseAdWithDuration(input: $input) {
      success
      purchase_id
    }
  }
`;
