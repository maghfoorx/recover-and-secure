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

export type EventReportPdfData = {
  generatedAt: string;
  summary: {
    lostItems: number;
    lostItemsFound: number;
    foundItems: number;
    foundItemsReturned: number;
    amaanatUsers: number;
    amaanatItems: number;
    amaanatItemsStored: number;
  };
  categoryTotals: {
    lost: Record<string, number>;
    found: Record<string, number>;
    amaanat: Record<string, number>;
    unreturnedFound: Record<string, number>;
  };
  unreturnedFoundItems: Array<Record<string, string>>;
};
