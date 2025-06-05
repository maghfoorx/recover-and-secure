import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  amaanat_users: defineTable({
    name: v.string(),
    aims_number: v.optional(v.string()),
    jamaat: v.optional(v.string()),
    phone_number: v.optional(v.string()),
  }),

  amaanat_items: defineTable({
    user_id: v.id("amaanat_users"),
    name: v.string(),
    details: v.optional(v.string()),
    location_id: v.id("amaanat_locations"),
    entry_date: v.number(), // Unix timestamp
    returned_by: v.optional(v.string()),
    is_returned: v.boolean(),
    returned_at: v.optional(v.number()), // Unix timestamp
  })
    .index("by_user", ["user_id"])
    .index("by_returned_status", ["is_returned"]),

  amaanat_locations: defineTable({
    number: v.number(), // globally unique ID like 1, 2, 3...
    size: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
    is_occupied: v.boolean(),
  })
    .index("by_occupied", ["is_occupied"])
    .index("by_number", ["number"])
    .index("by_size", ["size"]),

  lost_items: defineTable({
    date_reported: v.number(), // Unix timestamp
    name: v.string(),
    details: v.optional(v.string()),
    location_lost: v.optional(v.string()),
    reporter_name: v.optional(v.string()),
    aims_number: v.optional(v.string()),
    phone_number: v.optional(v.string()),
    is_found: v.boolean(),
    found_item_id: v.optional(v.id("found_items")),
  })
    .index("by_found_status", ["is_found"])
    .index("by_reporter", ["aims_number"])
    .index("by_found_item", ["found_item_id"]),

  found_items: defineTable({
    found_date: v.number(), // Unix timestamp
    name: v.string(),
    details: v.optional(v.string()),
    location_found: v.optional(v.string()),
    location_stored: v.optional(v.string()),
    finder_name: v.optional(v.string()),
    finder_aims_number: v.optional(v.string()),
    returned_to_aims_number: v.optional(v.string()),
    returned_to_name: v.optional(v.string()),
    received_by: v.optional(v.string()),
    is_returned: v.boolean(),
    returned_at: v.optional(v.number()), // Unix timestamp
    returned_by: v.optional(v.string()),
    lost_item_id: v.optional(v.id("lost_items")),
  })
    .index("by_returned_status", ["is_returned"])
    .index("by_finder", ["finder_aims_number"])
    .index("by_lost_item", ["lost_item_id"]),
});
