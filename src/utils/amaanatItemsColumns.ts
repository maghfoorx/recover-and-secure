import { AmaanatUserItemType } from "@/type-definitions/types.amaanat";

export const amaanatColumns = [
    {
        name: 'Name',
        selector: (row: AmaanatUserItemType) => row.ItemName
    },
    {
        name: 'Stored Location',
        selector: (row: AmaanatUserItemType) => row.StoredLocation
    },
    {
        name: 'Returned',
        selector: (row: AmaanatUserItemType) => row.Returned
    }
]