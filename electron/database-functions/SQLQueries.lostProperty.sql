--to create lost items table
CREATE TABLE lost_items (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Date TEXT DEFAULT CURRENT_DATE,
  ItemName TEXT,
  Details TEXT,
  LostArea TEXT,
  PersonName TEXT,
  AimsID TEXT,
  PhoneNumber TEXT,
  ItemFound BOOLEAN DEFAULT false
);

-- mock data for lost_items
INSERT INTO lost_items (ItemName, Details, LostArea, PersonName, AimsID, PhoneNumber)
VALUES
  ('Wallet', 'Black leather bi-fold wallet with ID and credit cards', 'Coffee shop', 'John Smith', 12345, '555-123-4567'),
  ('Keys', 'Silver house key, car key, and office key', 'Parking lot', 'Jane Doe', 54321, '555-987-6543'),
  ('Phone', 'iPhone X with black case and cracked screen', 'Bus station', 'Alex Lee', 67890, '555-555-1212');

--to create found items table
CREATE TABLE found_items (
  ID INTEGER PRIMARY KEY AUTOINCREMENT,
  FoundDate TEXT DEFAULT CURRENT_DATE,
  ItemName TEXT,
  Details TEXT,
  FoundArea TEXT,
  FinderName DEFAULT NULL,
  AIMSNumber DEFAULT NULL,
  ReceivedBy DEFAULT NULL
);

-- mock data for found_items
INSERT INTO found_items (ItemName, Details, FoundArea) VALUES ('iPhone', 'Black case, cracked screen', 'Main Street');
INSERT INTO found_items (ItemName, Details, FoundArea) VALUES ('Wallet', 'Brown leather, contains ID and credit cards', 'Central Park');
INSERT INTO found_items (ItemName, Details, FoundArea) VALUES ('Keys', 'Gold keychain, includes house key and car key', 'Downtown');
INSERT INTO found_items (ItemName, Details, FoundArea) VALUES ('Sunglasses', 'Aviator style, polarized lenses', 'Shopping Mall');

-- creating returned_items table

PRAGMA foreign_keys = ON;

CREATE TABLE returned_items (
  ReturnID INTEGER PRIMARY KEY,
  ItemID INTEGER REFERENCES found_items(ID),
  ReturnDate TEXT DEFAULT CURRENT_DATE,
  PersonName TEXT,
  AimsNumber TEXT,
	ReturnedBy TEXT
);
