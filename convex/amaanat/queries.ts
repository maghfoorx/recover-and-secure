import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc, Id } from "convex/_generated/dataModel";
import { getAll, getManyFrom } from "convex-helpers/server/relationships";

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
    const db = ctx.db;

    // Step 1: Get all items for the user
    const items = await getManyFrom(
      db,
      "amaanat_items",
      "by_user",
      args.userId,
      "user_id", // this is required because your index isn't named exactly as the field
    );

    // Step 2: Collect unique, non-null location_ids
    const locationIds = items
      .map((item) => item.location_id)
      .filter((id): id is Id<"amaanat_locations"> => !!id);

    // Step 3: Fetch all related locations in one go
    const locations = await getAll(db, locationIds);

    const cleanLocations = locations.filter((location) => !!location);

    const locationMap = new Map(cleanLocations.map((loc) => [loc._id, loc]));

    // Step 4: Attach locationNumber to each item
    return items.map((item) => ({
      ...item,
      locationNumber: item.location_id
        ? (locationMap.get(item.location_id)?.number ?? null)
        : null,
      locationSize: item.location_id
        ? (locationMap.get(item.location_id)?.size ?? null)
        : null,
    }));
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
