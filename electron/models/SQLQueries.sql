--to create lost items table
CREATE TABLE lost_items (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Date TEXT DEFAULT CURRENT_DATE,
  ItemName TEXT,
  Details TEXT,
  LostArea TEXT,
  PersonName TEXT,
  AimsID INTEGER,
  PhoneNumber TEXT,
  ItemFound BOOLEAN DEFAULT false
);