import { FoundItemType, LostItemType } from "@/type-definitions/types.lostProperty";

export const tableStyles = {
    rows: {
        style: {
            cursor: "pointer",
            fontSize: '1.2rem',
            '&:hover': {
                backgroundColor: '#f5f5f5'
            }
        }
    },
    headCells: {
        style: {
            fontSize: "1.3rem",
            fontWeight: "bold"
        }
    }
}

export const foundConditionalRowStyles = [
    {
      when: (row: FoundItemType) => !!row.PersonName,
      style: {
        color: 'green',
      },
    },
    {
      when: (row: FoundItemType) => !row.PersonName,
      style: {
        color: 'red',
      },
    },
];

//conditional styles for lostitems

export const lostConditionalRowStyles = [
    {
      when: (row: LostItemType) => row.ItemFound === "Yes",
      style: {
        color: 'green',
      },
    },
    {
      when: (row: LostItemType) => row.ItemFound === "No",
      style: {
        color: 'red',
      },
    },
];