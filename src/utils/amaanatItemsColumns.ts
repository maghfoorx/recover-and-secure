import { AmaanatUserItemType } from "@/type-definitions/types.amaanat";
import { formatBoolean } from "./formatBoolean";

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
        selector: (row: AmaanatUserItemType) => formatBoolean(row.Returned)
    }
]