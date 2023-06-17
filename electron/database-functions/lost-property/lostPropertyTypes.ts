export interface PostLostItemType {
    PersonName: string;
    ItemName: string;
    Details: string;
    LostArea: string;
    PhoneNumber: string;
    AimsID: string;
  }
  
  export type PostFoundItem = {
    ItemName: String;
    Details: String;
    FoundArea: String;
    FinderName: String;
    AIMSNumber: String;
    ReceivedBy: String;
  }
  
  export type ReturnFormType = {
    PersonName: string;
    AimsNumber: string;
    ReturnedBy: string;
    itemID: number;
  }