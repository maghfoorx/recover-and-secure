import { getLostItemCategoryLabel } from "./lostItemCategories";

export const OTHER_AMAANAT_CATEGORY = "other";

/**
 * Amaanat (left-luggage) item categories.
 *
 * Derived from ~1,300 items actually stored during Jalsa Salana last year,
 * not from assumptions. Left luggage is overwhelmingly bags and bulky
 * belongings (chairs, buggies, bedding), so the bag family is split into the
 * subtypes staff really use, and small lost-property categories that never
 * appeared here (keys, wallet, jewellery) are intentionally excluded — those
 * belong to the Lost Property workflow instead.
 *
 * Ordering follows real frequency, grouped bags-first then bulky then valuables.
 */
export const AMAANAT_ITEM_CATEGORIES = [
  { value: "bag", label: "Bag" },
  { value: "backpack", label: "Backpack" },
  { value: "suitcase", label: "Suitcase" },
  { value: "carrier_bag", label: "Carrier bag" },
  { value: "handbag", label: "Handbag" },
  { value: "duffle_bag", label: "Duffle bag" },
  { value: "pouch", label: "Pouch" },
  { value: "folding_chair", label: "Chair" },
  { value: "pushchair", label: "Pushchair" },
  { value: "tent", label: "Tent" },
  { value: "bedding", label: "Bedding" },
  { value: "jacket", label: "Jacket" },
  { value: "power_bank", label: "Power bank" },
  { value: "phone", label: "Phone" },
  { value: "phone_electronics", label: "Electronics" },
  { value: "perfume", label: "Perfume" },
  { value: "water_bottle", label: "Water bottle" },
  { value: "books_documents", label: "Books" },
  { value: "box_parcel", label: "Box" },
  { value: "mobility_aid", label: "Mobility aid" },
  { value: OTHER_AMAANAT_CATEGORY, label: "Other" },
] as const;

export function getAmaanatCategoryLabel(categoryValue: string) {
  const match = AMAANAT_ITEM_CATEGORIES.find(
    (category) => category.value === categoryValue,
  );
  if (match) {
    return match.label;
  }
  // Legacy Amaanat items were saved with the old shared lost-item slugs
  // (e.g. "phone", "bottle"); keep rendering their original label.
  return getLostItemCategoryLabel(categoryValue);
}

export function getAmaanatCategoryDisplayLabel(categoryValue: string) {
  const index = AMAANAT_ITEM_CATEGORIES.findIndex(
    (category) => category.value === categoryValue,
  );

  if (index !== -1) {
    return `${index + 1}. ${AMAANAT_ITEM_CATEGORIES[index].label}`;
  }

  return getLostItemCategoryLabel(categoryValue);
}
