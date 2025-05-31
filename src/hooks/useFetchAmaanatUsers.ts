import { AmaanatUserType } from "@/type/moduleTypes";
import { useEffect, useState } from "react";

export default function useFetchAmaanatUsers() {
  const [amaanatUsers, setAmaanatUsers] = useState<AmaanatUserType[]>([]);

  useEffect(() => {
    handleGetAmaanatUsers();
  }, []);

  async function handleGetAmaanatUsers() {}

  return { amaanatUsers, handleGetAmaanatUsers };
}
