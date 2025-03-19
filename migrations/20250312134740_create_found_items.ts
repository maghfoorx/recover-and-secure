import type { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("found_items", (table) => {
    table.increments("id").primary();
    table.date("found_date").defaultTo(knex.fn.now());
    table.string("name").notNullable();
    table.text("details");
    table.string("location_found");

    table.string("finder_name").nullable();
    table.string("finder_aims_number").nullable();

    table.string("returned_to_aims_number").nullable();
    table.string("returned_to_name").nullable();

    table.string("received_by").nullable();

    table.boolean("is_returned").defaultTo(false);
    table.date("returned_at").nullable();
    table.string("returned_by").nullable();

    table
      .integer("lost_item_id")
      .unsigned()
      .references("id")
      .inTable("lost_items")
      .onDelete("SET NULL");
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("found_items");
}
