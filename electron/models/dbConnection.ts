import sqlite3 from "sqlite3";

export const db = new sqlite3.Database(
  "D:/Programming/github-repos/lost-property/electron/models/database.db"
);
