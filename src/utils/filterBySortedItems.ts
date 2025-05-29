import { AmaanatItem, AmaanatUser } from "convex/types";

export function filterByStoredItems(
  users: AmaanatUser[],
  items: AmaanatItem[],
) {
  const storedItems = items.filter((item) => !!item.is_returned);
  const storedUserIDs = storedItems.map((item) => item.user_id);
  const filteredUsers = users.filter((user) =>
    storedUserIDs.includes(user._id),
  );

  return filteredUsers;
}
