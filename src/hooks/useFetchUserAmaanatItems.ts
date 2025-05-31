import { AmaanatUserItemType, AmaanatUserType } from "@/type/moduleTypes";
import { useEffect, useState } from "react";

type UseFetchAmaanatItemsType = {
  ID: string;
};

export default function useFetchUserAmaanatItems({
  ID,
}: UseFetchAmaanatItemsType) {
  const [amaanatItems, setAmaanatItems] = useState<AmaanatUserItemType[]>([]);
  const [amaanatUser, setAmaanatUser] = useState<AmaanatUserType | null>(null);

  useEffect(() => {
    handleGetUserAmaanatItems(ID);
    handleGetAmaanatUser(ID);
  }, []);

  async function handleGetUserAmaanatItems(ID: string | number) {}

  async function handleGetAmaanatUser(ID: string) {}

  return {
    amaanatItems,
    handleGetUserAmaanatItems,
    amaanatUser,
    handleGetAmaanatUser,
  };
}
