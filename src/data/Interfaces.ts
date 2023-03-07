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
