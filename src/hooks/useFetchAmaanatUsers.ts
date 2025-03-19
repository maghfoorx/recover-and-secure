import { getAmaanatUsers } from "@/apiApi/modules/amaanat";
import { AmaanatUserType } from "@/type/moduleTypes";
import { useEffect, useState } from "react";

export default function useFetchAmaanatUsers() {
  const [amaanatUsers, setAmaanatUsers] = useState<AmaanatUserType[]>([]);

  useEffect(() => {
    handleGetAmaanatUsers();
  }, []);

  async function handleGetAmaanatUsers() {
    const response = await getAmaanatUsers();
    setAmaanatUsers(response);
  }

  return { amaanatUsers, handleGetAmaanatUsers };
}
