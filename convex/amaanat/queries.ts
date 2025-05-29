import { v } from "convex/values";
import { query } from "../_generated/server";

// Get all amaanat users (ordered by creation time, newest first)
export const getAllAmaanatUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("amaanat_users").order("desc").collect();
  },
});

// Get a specific amaanat user by ID
export const getAmaanatUser = query({
  args: { id: v.id("amaanat_users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all items for a specific user
export const getUserAmaanatItems = query({
  args: { userId: v.id("amaanat_users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("amaanat_items")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .collect();
  },
});

// Get total amaanat items
export const getTotalAmaanatItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("amaanat_items").collect();
  },
});

// Get unreturned amaanat items
export const getUnreturnedAmaanatItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("amaanat_items")
      .withIndex("by_returned_status", (q) => q.eq("is_returned", false))
      .collect();
  },
});

// Get returned amaanat items
export const getReturnedAmaanatItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("amaanat_items")
      .withIndex("by_returned_status", (q) => q.eq("is_returned", true))
      .collect();
  },
});

// Get amaanat items with user details (join query)
export const getAmaanatItemsWithUserDetails = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("amaanat_items").collect();

    const itemsWithUsers = await Promise.all(
      items.map(async (item) => {
        const user = await ctx.db.get(item.user_id);
        return {
          ...item,
          user: user,
        };
      }),
    );

    return itemsWithUsers;
  },
});
