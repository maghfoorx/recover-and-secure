import knex from "knex";
import { app } from "electron";
import path from "path";

const isDev = !app.isPackaged;
const dbPath = isDev
  ? "./database.sqlite3"
  : path.join(path.dirname(process.resourcesPath), "./database.sqlite3");

const db = knex({
  client: "sqlite3",
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});

export default db;
