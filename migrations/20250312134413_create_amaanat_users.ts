import type { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("amaanat_users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("aims_no");
    table.string("jamaat");
    table.string("phone_no");
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("amaanat_users");
}
