import { AmaanatUserItemType, AmaanatUserType } from "@/type/moduleTypes";

export function filterByStoredItems(
  users: AmaanatUserType[],
  items: AmaanatUserItemType[],
) {
  const storedItems = items.filter((item) => item.is_returned === 0);
  const storedUserIDs = storedItems.map((item) => item.user_id);
  const filteredUsers = users.filter((user) => storedUserIDs.includes(user.id));

  return filteredUsers;
}
