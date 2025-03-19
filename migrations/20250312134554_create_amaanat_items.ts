import type { Knex } from "knex";

export function up(knex: Knex) {
  return knex.schema.createTable("amaanat_items", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("amaanat_users")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.text("details");
    table.string("location");
    table.date("entry_date").defaultTo(knex.fn.now());
    table.string("returned_by").nullable();
    table.boolean("is_returned").defaultTo(false);
    table.date("returned_at").nullable();
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable("amaanat_items");
}
