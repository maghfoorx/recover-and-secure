import { FoundItemType, LostItemType } from "@/type/moduleTypes";
import {
  getFoundItemsReported,
  getLostItemsReported,
} from "@/apiApi/modules/lostProperty";
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

  async function handleGetLostItems() {
    const response = await getLostItemsReported();
    setLostItems(response);
  }

  async function handleGetFoundItems() {
    const response = await getFoundItemsReported();
    setFoundItems(response);
  }

  useEffect(() => {
    handleGetLostItems();
    handleGetFoundItems();
  }, []);

  return { lostItems, handleGetLostItems, foundItems, handleGetFoundItems };
}
