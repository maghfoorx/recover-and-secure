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