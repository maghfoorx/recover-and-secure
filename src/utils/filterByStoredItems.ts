import { AmaanatUserItemType, AmaanatUserType } from "@/type-definitions/types.amaanat";

export function filterByStoredItems(users: AmaanatUserType[], items: AmaanatUserItemType[]) {
    const storedItems = items.filter(item => item.Returned === 0)
    const storedUserIDs = storedItems.map(item => item.UserID)
    const filteredUsers = users.filter(user => storedUserIDs.includes(user.ID))

    return filteredUsers;
}