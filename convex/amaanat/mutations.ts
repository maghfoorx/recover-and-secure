// convex/amaanat/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Register a new amaanat user
export const addAmaanatUser = mutation({
  args: {
    name: v.string(),
    aims_number: v.optional(v.string()),
    jamaat: v.optional(v.string()),
    phone_number: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("amaanat_users", {
      name: args.name,
      aims_number: args.aims_number,
      jamaat: args.jamaat,
      phone_number: args.phone_number,
    });

    // Return the created user
    return await ctx.db.get(userId);
  },
});

// Updated addAmaanatItem mutation
export const addAmaanatItem = mutation({
  args: {
    user_id: v.id("amaanat_users"),
    name: v.string(),
    details: v.optional(v.string()),
    location: v.id("amaanat_locations"),
  },
  handler: async (ctx, args) => {
    const db = ctx.db;

    // Verify user exists
    const user = await db.get(args.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    // Check location
    const location = await db.get(args.location);
    if (!location) {
      throw new Error("Location not found");
    }

    // If location is occupied, check if it's occupied by the same user
    if (location.is_occupied) {
      // Find any item in this location
      const existingItem = await db
        .query("amaanat_items")
        .filter((q) =>
          q.and(
            q.eq(q.field("location_id"), args.location),
            q.eq(q.field("is_returned"), false),
          ),
        )
        .first();

      if (existingItem && existingItem.user_id !== args.user_id) {
        throw new Error("Location is occupied by another user");
      }
    }

    // Mark location as occupied (if not already)
    if (!location.is_occupied) {
      await db.patch(args.location, {
        is_occupied: true,
      });
    }

    // Insert the item
    const itemId = await db.insert("amaanat_items", {
      user_id: args.user_id,
      name: args.name,
      details: args.details,
      location_id: args.location,
      entry_date: Date.now(),
      is_returned: false,
    });

    return await db.get(itemId);
  },
});

// Updated returnAmaanatItem mutation to handle multiple items per location
export const returnAmaanatItem = mutation({
  args: {
    id: v.id("amaanat_items"),
    returned_by: v.string(),
  },
  handler: async (ctx, args) => {
    const db = ctx.db;

    const item = await db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }

    // Mark item as returned
    await db.patch(args.id, {
      is_returned: true,
      returned_by: args.returned_by,
      returned_at: Date.now(),
    });

    // Check if there are any other unreturned items in the same location
    const remainingItems = await db
      .query("amaanat_items")
      .filter((q) =>
        q.and(
          q.eq(q.field("location_id"), item.location_id),
          q.eq(q.field("is_returned"), false),
        ),
      )
      .collect();

    // If no items remain in this location, mark location as unoccupied
    if (remainingItems.length === 0) {
      await db.patch(item.location_id, {
        is_occupied: false,
      });
    }

    return await db.get(args.id);
  },
});

// Update amaanat user
export const updateAmaanatUser = mutation({
  args: {
    id: v.id("amaanat_users"),
    name: v.optional(v.string()),
    aims_number: v.optional(v.string()),
    jamaat: v.optional(v.string()),
    phone_number: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No updates provided");
    }

    await ctx.db.patch(id, cleanUpdates);
    return await ctx.db.get(id);
  },
});

// Delete amaanat user (this will cascade delete items due to schema)
export const deleteAmaanatUser = mutation({
  args: { id: v.id("amaanat_users") },
  handler: async (ctx, args) => {
    // First delete all items for this user (manual cascade)
    const userItems = await ctx.db
      .query("amaanat_items")
      .withIndex("by_user", (q) => q.eq("user_id", args.id))
      .collect();

    for (const item of userItems) {
      await ctx.db.delete(item._id);
    }

    // Then delete the user
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Delete amaanat item
export const deleteAmaanatItem = mutation({
  args: { id: v.id("amaanat_items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
