export const OTHER_LOST_ITEM_CATEGORY = "other";

export const LOST_ITEM_CATEGORIES = [
  { value: "bag", label: "Bag" },
  { value: "bottle", label: "Bottle" },
  { value: "clothing", label: "Clothing" },
  { value: "electronics", label: "Electronics" },
  { value: "jewellery", label: "Jewellery" },
  { value: "keys", label: "Keys" },
  { value: "passport_documents", label: "Passport / Documents" },
  { value: "phone", label: "Phone" },
  { value: "suitcase", label: "Suitcase" },
  { value: "wallet", label: "Wallet" },
  { value: OTHER_LOST_ITEM_CATEGORY, label: "Not listed" },
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
