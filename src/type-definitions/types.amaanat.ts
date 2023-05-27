export type AmaanatUserType = {
    ID: number;
    AIMSNo: string;
    Name: string;
    PhoneNo: string;
}

export type AmaanatUserItemType = {
    ID: number;
    UserID: number;
    ItemName: string;
    ItemDetails: string;
    StoredLocation: string;
    EntryDate: string;
    Returned: 0 | 1;
    ReturnedBy: string | null;
}