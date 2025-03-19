export type PostLostItemType = {
  reporter_name: string;
  name: string;
  details: string;
  location_lost: string;
  aims_number: string;
  phone_number: string;
  is_found: boolean;
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
  id: number;
  returned_by: string;
  returned_to_name: string;
  returned_to_aims_number: string;
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
  returned_by: string;
};

export type PrintReceiptDataType = {
  itemsNumber: string;
  aimsID: string;
  location: string;
  computerName: string;
};
