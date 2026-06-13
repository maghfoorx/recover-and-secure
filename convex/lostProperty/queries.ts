import { v } from "convex/values";
import { query } from "../_generated/server";

function countByCategory<T extends { category_slug?: string }>(items: T[]) {
  return items.reduce<Record<string, number>>((totals, item) => {
    const categorySlug = item.category_slug ?? "uncategorized";
    totals[categorySlug] = (totals[categorySlug] ?? 0) + 1;
    return totals;
  }, {});
}

export const getLostItemsReported = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("lost_items").order("desc").collect();
  },
});

export const getFoundItemsReported = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("found_items").order("desc").collect();
  },
});

export const getLostItemsByFoundStatus = query({
  args: { isFound: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lost_items")
      .withIndex("by_found_status", (q) => q.eq("is_found", args.isFound))
      .collect();
  },
});

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

export const getLostItemsByReporter = query({
  args: { aimsNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lost_items")
      .withIndex("by_reporter", (q) => q.eq("aims_number", args.aimsNumber))
      .collect();
  },
});

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

export const getLostItem = query({
  args: { id: v.id("lost_items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getFoundItem = query({
  args: { id: v.id("found_items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

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

export const getUnmatchedLostItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("lost_items")
      .withIndex("by_found_status", (q) => q.eq("is_found", false))
      .collect();
  },
});

export const getUnmatchedFoundItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("found_items")
      .filter((q) => q.eq(q.field("lost_item_id"), undefined))
      .collect();
  },
});

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    const [lostItems, foundItems, amaanatUsers, amaanatItems] =
      await Promise.all([
        ctx.db.query("lost_items").collect(),
        ctx.db.query("found_items").collect(),
        ctx.db.query("amaanat_users").collect(),
        ctx.db.query("amaanat_items").collect(),
      ]);

    const lostItemsFound = lostItems.filter((item) => item.is_found).length;
    const foundItemsReturned = foundItems.filter((item) => item.is_returned)
      .length;
    const foundItemsInStorage = foundItems.length - foundItemsReturned;
    const matchedItems = foundItems.filter((item) => item.lost_item_id != null)
      .length;
    const amaanatItemsStored = amaanatItems.filter((item) => !item.is_returned)
      .length;
    const storedUserIds = new Set(
      amaanatItems
        .filter((item) => !item.is_returned)
        .map((item) => item.user_id),
    );

    return {
      lostItems: lostItems.length,
      lostItemsFound,
      openLostReports: lostItems.length - lostItemsFound,
      foundItems: foundItems.length,
      foundItemsReturned,
      foundItemsInStorage,
      matchedItems,
      amaanatUsers: amaanatUsers.length,
      amaanatItems: amaanatItems.length,
      amaanatItemsStored,
      storedItemUsers: storedUserIds.size,
      totalOpenInventory: foundItemsInStorage + amaanatItemsStored,
    };
  },
});

export const getDashboardReportData = query({
  args: {},
  handler: async (ctx) => {
    const [lostItems, foundItems, amaanatUsers, amaanatItems] =
      await Promise.all([
        ctx.db.query("lost_items").collect(),
        ctx.db.query("found_items").collect(),
        ctx.db.query("amaanat_users").collect(),
        ctx.db.query("amaanat_items").collect(),
      ]);

    const lostItemsFound = lostItems.filter((item) => item.is_found).length;
    const foundItemsReturned = foundItems.filter((item) => item.is_returned)
      .length;
    const amaanatItemsStored = amaanatItems.filter((item) => !item.is_returned)
      .length;
    const unreturnedFoundItems = foundItems.filter((item) => !item.is_returned);

    return {
      generatedAt: new Date().toLocaleString("en-GB"),
      summary: {
        lostItems: lostItems.length,
        lostItemsFound,
        foundItems: foundItems.length,
        foundItemsReturned,
        amaanatUsers: amaanatUsers.length,
        amaanatItems: amaanatItems.length,
        amaanatItemsStored,
      },
      categoryTotals: {
        lost: countByCategory(lostItems),
        found: countByCategory(foundItems),
        amaanat: countByCategory(amaanatItems),
        unreturnedFound: countByCategory(unreturnedFoundItems),
      },
      unreturnedFoundItems,
    };
  },
});
