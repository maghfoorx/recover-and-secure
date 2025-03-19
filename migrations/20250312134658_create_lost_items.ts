import type { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("lost_items", (table) => {
    table.increments("id").primary();
    table.date("date").defaultTo(knex.fn.now());
    table.string("item_name").notNullable();
    table.text("details");
    table.string("lost_area");
    table.string("person_name");
    table.string("aims_id");
    table.string("phone_number");
    table.boolean("item_found").defaultTo(false);
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("lost_items");
}
