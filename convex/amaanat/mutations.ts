import { mutation } from "../_generated/server";
import { v } from "convex/values";

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

    return await ctx.db.get(userId);
  },
});

export const addAmaanatItem = mutation({
  args: {
    user_id: v.id("amaanat_users"),
    name: v.string(),
    details: v.optional(v.string()),
    location: v.id("amaanat_locations"),
  },
  handler: async (ctx, args) => {
    const db = ctx.db;

    const user = await db.get(args.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const location = await db.get(args.location);
    if (!location) {
      throw new Error("Location not found");
    }

    if (location.is_occupied) {
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

    if (!location.is_occupied) {
      await db.patch(args.location, {
        is_occupied: true,
      });
    }

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

    await db.patch(args.id, {
      is_returned: true,
      returned_by: args.returned_by,
      returned_at: Date.now(),
    });

    const remainingItems = await db
      .query("amaanat_items")
      .filter((q) =>
        q.and(
          q.eq(q.field("location_id"), item.location_id),
          q.eq(q.field("is_returned"), false),
        ),
      )
      .collect();

    if (remainingItems.length === 0) {
      await db.patch(item.location_id, {
        is_occupied: false,
      });
    }

    return await db.get(args.id);
  },
});

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

export const deleteAmaanatUser = mutation({
  args: { id: v.id("amaanat_users") },
  handler: async (ctx, args) => {
    const userItems = await ctx.db
      .query("amaanat_items")
      .withIndex("by_user", (q) => q.eq("user_id", args.id))
      .collect();

    for (const item of userItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const deleteAmaanatItem = mutation({
  args: { id: v.id("amaanat_items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
