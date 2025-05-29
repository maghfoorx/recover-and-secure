// convex/lostProperty/queries.ts
import { v } from "convex/values";
import { query } from "../_generated/server";

// Get all lost items reported
export const getLostItemsReported = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lost_items").order("desc").collect();
  },
});

// Get all found items reported
export const getFoundItemsReported = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("found_items").order("desc").collect();
  },
});

// Get lost items by found status
export const getLostItemsByFoundStatus = query({
  args: { isFound: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lost_items")
      .withIndex("by_found_status", (q) => q.eq("is_found", args.isFound))
      .collect();
  },
});

// Get found items by returned status
export const getFoundItemsByReturnedStatus = query({
  args: { isReturned: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("found_items")
      .withIndex("by_returned_status", (q) =>
        q.eq("is_returned", args.isReturned),
      )
      .collect();
  },
});

// Get lost items by reporter AIMS number
export const getLostItemsByReporter = query({
  args: { aimsNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lost_items")
      .withIndex("by_reporter", (q) => q.eq("aims_number", args.aimsNumber))
      .collect();
  },
});

// Get found items by finder AIMS number
export const getFoundItemsByFinder = query({
  args: { finderAimsNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("found_items")
      .withIndex("by_finder", (q) =>
        q.eq("finder_aims_number", args.finderAimsNumber),
      )
      .collect();
  },
});

// Get a specific lost item by ID
export const getLostItem = query({
  args: { id: v.id("lost_items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get a specific found item by ID
export const getFoundItem = query({
  args: { id: v.id("found_items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get lost items with their matched found items
export const getLostItemsWithFoundItems = query({
  args: {},
  handler: async (ctx) => {
    const lostItems = await ctx.db.query("lost_items").collect();
    const lostItemsWithFoundItems = await Promise.all(
      lostItems.map(async (lostItem) => {
        const foundItem = lostItem.found_item_id
          ? await ctx.db.get(lostItem.found_item_id)
          : null;
        return {
          ...lostItem,
          foundItem,
        };
      }),
    );
    return lostItemsWithFoundItems;
  },
});

// Get found items with their matched lost items
export const getFoundItemsWithLostItems = query({
  args: {},
  handler: async (ctx) => {
    const foundItems = await ctx.db.query("found_items").collect();
    const foundItemsWithLostItems = await Promise.all(
      foundItems.map(async (foundItem) => {
        const lostItem = foundItem.lost_item_id
          ? await ctx.db.get(foundItem.lost_item_id)
          : null;
        return {
          ...foundItem,
          lostItem,
        };
      }),
    );
    return foundItemsWithLostItems;
  },
});

// Get matched items (both lost and found together)
export const getMatchedItems = query({
  args: {},
  handler: async (ctx) => {
    const lostItems = await ctx.db
      .query("lost_items")
      .withIndex("by_found_status", (q) => q.eq("is_found", true))
      .collect();

    const matchedItems = await Promise.all(
      lostItems.map(async (lostItem) => {
        const foundItem = lostItem.found_item_id
          ? await ctx.db.get(lostItem.found_item_id)
          : null;
        return {
          lostItem,
          foundItem,
        };
      }),
    );

    return matchedItems.filter((item) => item.foundItem !== null);
  },
});

// Get unmatched lost items
export const getUnmatchedLostItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("lost_items")
      .withIndex("by_found_status", (q) => q.eq("is_found", false))
      .collect();
  },
});

// Get unmatched found items
export const getUnmatchedFoundItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("found_items")
      .filter((q) => q.eq(q.field("lost_item_id"), undefined))
      .collect();
  },
});
