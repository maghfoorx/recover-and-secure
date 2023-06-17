export type AmaanatUserType = {
    Name: String;
    AIMSNo: String;
    Jamaat: String;
    PhoneNo: String;
}

export type AddAmaanatItemType = {
    ItemName: string;
    ItemDetails: string;
    StoredLocation: string;
    UserID: string;
}

export type ReturnAmaanatType = {
    id: number;
    returnedBy: string;
}