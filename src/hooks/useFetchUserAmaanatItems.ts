import { getAmaanatUser, getUserAmaanatItems } from "@/apiApi/modules/amaanat";
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

  async function handleGetUserAmaanatItems(ID: string | number) {
    const response = await getUserAmaanatItems(ID);
    setAmaanatItems(response);
  }

  async function handleGetAmaanatUser(ID: string) {
    const response = await getAmaanatUser(ID);
    setAmaanatUser(response);
  }

  return {
    amaanatItems,
    handleGetUserAmaanatItems,
    amaanatUser,
    handleGetAmaanatUser,
  };
}
