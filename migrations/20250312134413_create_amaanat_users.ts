import type { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("amaanat_users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("aims_number");
    table.string("jamaat");
    table.string("phone_number");
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("amaanat_users");
}
