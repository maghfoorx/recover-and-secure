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

// Add a new amaanat item
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

    // Mark location as occupied
    const location = await db.get(args.location);
    if (!location) {
      throw new Error("Location not found");
    }

    if (location.is_occupied) {
      throw new Error("Location is already occupied");
    }

    await db.patch(args.location, {
      is_occupied: true,
    });

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

// Return an amaanat item
export const returnAmaanatItem = mutation({
  args: {
    id: v.id("amaanat_items"),
    returned_by: v.string(),
  },
  handler: async (ctx, args) => {
    const db = ctx.db;

    // Step 1: Verify item exists
    const item = await db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }

    // Step 2: Check if already returned
    if (item.is_returned) {
      throw new Error("Item is already returned");
    }

    // Step 3: Mark the item as returned
    await db.patch(args.id, {
      is_returned: true,
      returned_by: args.returned_by,
      returned_at: Date.now(),
    });

    // Step 4: Mark the location as available again
    await db.patch(item.location_id, {
      is_occupied: false,
    });

    // Step 5: Return updated item
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
