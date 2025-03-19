export type AmaanatUserType = {
  id: number;
  aims_no: string;
  jamaat: string;
  name: string;
  phone_no: string;
  itemsData: {
    storedNumber: number;
    returnedNumber: number;
  };
};

export type AmaanatUserItemType = {
  id: number;
  user_id: number;
  item_name: string;
  item_details: string;
  stored_location: string;
  entry_date: string;
  returned: 0 | 1;
  returned_by: string | null;
  returned_date: string | null;
};

export type AmaanatSelectedRowsDataType = {
  allSelected: boolean;
  selectedCount: number;
  selectedRows: AmaanatUserItemType[];
};

export interface LostItemType {
  id: number;
  item_name: string;
  details: string;
  lost_area: string;
  person_name: string;
  phone_number: string;
  aims_id: number;
  item_found: "Yes" | "No";
}

export interface FoundItemType {
  id: number;
  item_name: string;
  details: string;
  found_date: string;
  found_area: string;
  returned_date: string | null;
  person_name: string | null;
  aims_number: string | null;
  returned: 0 | 1;
  returned_by: string | null;
  finder_name: string | null;
  received_by: string | null;
}
