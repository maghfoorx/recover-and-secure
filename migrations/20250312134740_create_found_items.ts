import type { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("found_items", (table) => {
    table.increments("id").primary();
    table.date("found_date").defaultTo(knex.fn.now());
    table.string("item_name").notNullable();
    table.text("details");
    table.string("found_area");
    table.string("finder_name").nullable();
    table.string("aims_number").nullable();
    table.string("received_by").nullable();

    table.boolean("returned").defaultTo(false);
    table.date("returned_date").nullable();
    table.string("returned_by").nullable();
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("found_items");
}
