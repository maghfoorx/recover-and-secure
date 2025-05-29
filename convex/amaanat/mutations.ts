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
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const itemId = await ctx.db.insert("amaanat_items", {
      user_id: args.user_id,
      name: args.name,
      details: args.details,
      location: args.location,
      entry_date: Date.now(), // Current timestamp
      is_returned: false,
    });

    // Return the created item
    return await ctx.db.get(itemId);
  },
});

// Return an amaanat item
export const returnAmaanatItem = mutation({
  args: {
    id: v.id("amaanat_items"),
    returned_by: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify item exists
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Item not found");
    }

    // Check if item is already returned
    if (item.is_returned) {
      throw new Error("Item is already returned");
    }

    // Update the item
    await ctx.db.patch(args.id, {
      is_returned: true,
      returned_by: args.returned_by,
      returned_at: Date.now(), // Current timestamp
    });

    // Return the updated item
    return await ctx.db.get(args.id);
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
