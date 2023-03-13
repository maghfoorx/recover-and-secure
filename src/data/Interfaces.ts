export interface LostItemType {
  ID: number;
  ItemName: string;
  Details: string;
  LostArea: string;
  PersonName: string;
  PhoneNumber: string;
  AimsID: number;
  ItemFound: "Yes" | "No";
}

export interface FoundItemType {
  ID: number;
  ItemName: string;
  Details: string;
  FoundDate: string;
  FoundArea: string;
  ReturnDate: string | null;
  Returned: "Yes" | "No";
  ReturnedBy: string | null;
}
