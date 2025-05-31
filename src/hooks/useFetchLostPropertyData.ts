import { FoundItemType, LostItemType } from "@/type/moduleTypes";
import { useEffect, useState } from "react";

interface UseFetchLostItemsType {
  lostItems: LostItemType[];
  handleGetLostItems: () => Promise<void>;
  foundItems: FoundItemType[];
  handleGetFoundItems: () => Promise<void>;
}

export default function useFetchLostPropertyData(): UseFetchLostItemsType {
  const [lostItems, setLostItems] = useState<LostItemType[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItemType[]>([]);

  async function handleGetLostItems() {}

  async function handleGetFoundItems() {}

  useEffect(() => {
    handleGetLostItems();
    handleGetFoundItems();
  }, []);

  return { lostItems, handleGetLostItems, foundItems, handleGetFoundItems };
}
