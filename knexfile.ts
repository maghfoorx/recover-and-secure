import type { Knex } from "knex";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "database.sqlite3"),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, "migrations"),
  },
};

export default config;
