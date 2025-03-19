import type { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("lost_items", (table) => {
    table.increments("id").primary();
    table.date("date_reported").defaultTo(knex.fn.now());
    table.string("name").notNullable();
    table.text("details");
    table.string("location_lost");
    table.string("reporter_name");
    table.string("aims_number");
    table.string("phone_number");
    table.boolean("is_found").defaultTo(false);

    table
      .integer("found_item_id")
      .unsigned()
      .references("id")
      .inTable("found_items")
      .onDelete("SET NULL");
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("lost_items");
}
