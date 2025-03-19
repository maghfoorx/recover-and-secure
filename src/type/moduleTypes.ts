export type AmaanatUserType = {
  id: number;
  name: string;
  aims_number: string | null;
  jamaat: string | null;
  phone_number: string | null;
};

export type AmaanatUserItemType = {
  id: number;
  user_id: number;
  name: string;
  details: string | null;
  location: string | null;
  entry_date: string;
  returned_by: string | null;
  is_returned: 0 | 1;
  returned_at: string | null;
};

export type AmaanatSelectedRowsDataType = {
  allSelected: boolean;
  selectedCount: number;
  selectedRows: AmaanatUserItemType[];
};

export interface LostItemType {
  id: number;
  date_reported: string;
  name: string;
  details: string | null;
  location_lost: string | null;
  reporter_name: string | null;
  aims_number: string | null;
  phone_number: string | null;
  is_found: 0 | 1;
  found_item_id: number | null;
}

export interface FoundItemType {
  id: number;
  found_date: string;
  name: string;
  details: string | null;
  location_found: string | null;

  finder_name: string | null;
  finder_aims_number: string | null;

  returned_to_aims_number: string | null;
  returned_to_name: string | null;

  received_by: string | null;
  is_returned: 0 | 1;
  returned_at: string | null;
  returned_by: string | null;
  lost_item_id: number | null;
}
