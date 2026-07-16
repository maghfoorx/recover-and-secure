export const OTHER_LOST_ITEM_CATEGORY = "other";

/**
 * Lost & Found item categories.
 *
 * Ordered by real frequency from last year's ~140 lost item reports.
 * The top of the list is what staff actually pick most: phones, bags,
 * keys, wallets, glasses. Existing slugs from the previous "assumed"
 * list are preserved (suitcase, bottle, clothing, jewellery,
 * electronics) so historical rows still render — they sit lower in the
 * order since they were rare or unseen in real reports.
 */
export const LOST_ITEM_CATEGORIES = [
  { value: "phone", label: "Phone" },
  { value: "bag", label: "Bag" },
  { value: "keys", label: "Keys" },
  { value: "wallet", label: "Wallet" },
  { value: "glasses", label: "Glasses" },
  { value: "id_card", label: "ID card" },
  { value: "power_bank", label: "Power bank" },
  { value: "earphones", label: "Earphones" },
  { value: "jacket", label: "Jacket" },
  { value: "watch", label: "Watch" },
  { value: "bank_card", label: "Bank card" },
  { value: "shoes", label: "Shoes" },
  { value: "ring", label: "Ring" },
  { value: "cap", label: "Cap" },
  { value: "cash", label: "Cash" },
  { value: "passport_documents", label: "Passport" },
  { value: "medicine", label: "Medicine" },
  { value: "clothing", label: "Clothing" },
  { value: "bottle", label: "Bottle" },
  { value: "suitcase", label: "Suitcase" },
  { value: "jewellery", label: "Jewellery" },
  { value: "electronics", label: "Electronics" },
  { value: OTHER_LOST_ITEM_CATEGORY, label: "Other" },
] as const;

export function getLostItemCategoryLabel(categoryValue: string) {
  return (
    LOST_ITEM_CATEGORIES.find((category) => category.value === categoryValue)
      ?.label ?? ""
  );
}

export function getLostItemCategoryDisplayLabel(categoryValue: string) {
  const index = LOST_ITEM_CATEGORIES.findIndex(
    (category) => category.value === categoryValue,
  );

  if (index === -1) {
    return "";
  }

  return `${index + 1}. ${LOST_ITEM_CATEGORIES[index].label}`;
}
