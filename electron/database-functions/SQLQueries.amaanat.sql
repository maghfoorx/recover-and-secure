CREATE TABLE amaanat_users (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT,
  AIMSNo TEXT,
  PhoneNo TEXT
);

CREATE TABLE amaanat_items (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  UserID INTEGER,
  ItemName TEXT,
  ItemDetails TEXT,
  EntryDate DATE DEFAULT (DATE('now')),
  ReturnedBy TEXT DEFAULT NULL,
  Returned BOOLEAN DEFAULT 0,
  FOREIGN KEY (UserID) REFERENCES amaanat_users(ID)
);

INSERT INTO amaanat_items (UserID, ItemName, ItemDetails, ReturnedBy)
VALUES (1, 'Example Item', 'This is an example item');
