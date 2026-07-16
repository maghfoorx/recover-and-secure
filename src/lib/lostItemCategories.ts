export const OTHER_LOST_ITEM_CATEGORY = "other";

/**
 * Lost & Found item categories.
 *
 * Ordered by combined real frequency from last year — ~140 lost item
 * reports and ~250 found item reports. Phones and AIMS/ID cards
 * dominate; adds Chain, Umbrella, Toy, Book, Pushchair, Scarf, Cable,
 * and Sports so what staff physically encountered has its own slot.
 * Historical slugs from the previous "assumed" list (bottle, clothing,
 * jewellery, electronics) stay at the end so old rows keep rendering.
 */
export const LOST_ITEM_CATEGORIES = [
  { value: "phone", label: "Phone" },
  { value: "id_card", label: "AIMS / ID card" },
  { value: "bag", label: "Bag" },
  { value: "glasses", label: "Glasses" },
  { value: "wallet", label: "Wallet" },
  { value: "keys", label: "Keys" },
  { value: "bank_card", label: "Bank card" },
  { value: "ring", label: "Ring" },
  { value: "watch", label: "Watch" },
  { value: "power_bank", label: "Power bank" },
  { value: "jacket", label: "Jacket" },
  { value: "earphones", label: "Earphones" },
  { value: "cash", label: "Cash" },
  { value: "cap", label: "Cap" },
  { value: "shoes", label: "Shoes" },
  { value: "suitcase", label: "Suitcase" },
  { value: "medicine", label: "Medicine" },
  { value: "toy", label: "Toy" },
  { value: "passport_documents", label: "Passport" },
  { value: "chain", label: "Chain" },
  { value: "umbrella", label: "Umbrella" },
  { value: "book", label: "Book" },
  { value: "pushchair", label: "Pushchair" },
  { value: "scarf", label: "Scarf" },
  { value: "sports", label: "Sports equipment" },
  { value: "cable", label: "Cable" },
  { value: "clothing", label: "Clothing" },
  { value: "bottle", label: "Bottle" },
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
