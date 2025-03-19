export type PostLostItemType = {
  PersonName: string;
  ItemName: string;
  Details: string;
  LostArea: string;
  PhoneNumber: string;
  AimsID: string;
};

export type PostFoundItem = {
  ItemName: String;
  Details: String;
  FoundArea: String;
  FinderName: String;
  AIMSNumber: String;
  ReceivedBy: String;
};

export type ReturnFormType = {
  PersonName: string;
  AimsNumber: string;
  ReturnedBy: string;
  itemID: number;
};

export type AmaanatUserType = {
  Name: String;
  AIMSNo: String;
  Jamaat: String;
  PhoneNo: String;
};

export type AddAmaanatItemType = {
  ItemName: string;
  ItemDetails: string;
  StoredLocation: string;
  UserID: string;
};

export type ReturnAmaanatType = {
  id: number;
  returnedBy: string;
};

export type PrintReceiptDataType = {
  itemsNumber: string;
  aimsID: string;
  location: string;
  computerName: string;
};
