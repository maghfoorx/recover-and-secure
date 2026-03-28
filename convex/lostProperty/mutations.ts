import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const postLostItem = mutation({
  args: {
    name: v.string(),
    details: v.optional(v.string()),
    location_lost: v.optional(v.string()),
    reporter_name: v.optional(v.string()),
    aims_number: v.optional(v.string()),
    phone_number: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lostItemId = await ctx.db.insert("lost_items", {
      date_reported: Date.now(),
      name: args.name,
      details: args.details,
      location_lost: args.location_lost,
      reporter_name: args.reporter_name,
      aims_number: args.aims_number,
      phone_number: args.phone_number,
      is_found: false,
    });

    return await ctx.db.get(lostItemId);
  },
});

export const postFoundItem = mutation({
  args: {
    name: v.string(),
    details: v.optional(v.string()),
    location_found: v.optional(v.string()),
    location_stored: v.optional(v.string()),
    finder_name: v.optional(v.string()),
    finder_aims_number: v.optional(v.string()),
    received_by: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const foundItemId = await ctx.db.insert("found_items", {
      found_date: Date.now(),
      name: args.name,
      details: args.details,
      location_found: args.location_found,
      location_stored: args.location_stored,
      finder_name: args.finder_name,
      finder_aims_number: args.finder_aims_number,
      received_by: args.received_by,
      is_returned: false,
    });

    return await ctx.db.get(foundItemId);
  },
});

export const deleteLostItem = mutation({
  args: { id: v.id("lost_items") },
  handler: async (ctx, args) => {
    // Check if item exists
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Lost item not found");
    }

    // If the lost item is matched with a found item, unlink them
    if (item.found_item_id) {
      await ctx.db.patch(item.found_item_id, {
        lost_item_id: undefined,
      });
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const deleteFoundItem = mutation({
  args: { id: v.id("found_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Found item not found");
    }

    if (item.lost_item_id) {
      await ctx.db.patch(item.lost_item_id, {
        is_found: false,
        found_item_id: undefined,
      });
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const updateFoundColumn = mutation({
  args: { id: v.id("lost_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Lost item not found");
    }

    await ctx.db.patch(args.id, {
      is_found: true,
    });

    return await ctx.db.get(args.id);
  },
});

export const unFoundLostItem = mutation({
  args: { id: v.id("lost_items") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Lost item not found");
    }

    if (item.found_item_id) {
      await ctx.db.patch(item.found_item_id, {
        lost_item_id: undefined,
      });
    }

    await ctx.db.patch(args.id, {
      is_found: false,
      found_item_id: undefined,
    });

    return await ctx.db.get(args.id);
  },
});

export const returnFoundItem = mutation({
  args: {
    id: v.id("found_items"),
    returned_by: v.string(),
    returned_to_name: v.optional(v.string()),
    returned_to_aims_number: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Found item not found");
    }

    if (item.is_returned) {
      throw new Error("Item is already returned");
    }

    await ctx.db.patch(args.id, {
      is_returned: true,
      returned_at: Date.now(),
      returned_by: args.returned_by,
      returned_to_name: args.returned_to_name,
      returned_to_aims_number: args.returned_to_aims_number,
    });

    return await ctx.db.get(args.id);
  },
});

export const matchLostItemWithFoundItem = mutation({
  args: {
    lostItemId: v.id("lost_items"),
    foundItemId: v.id("found_items"),
  },
  handler: async (ctx, args) => {
    const [lostItem, foundItem] = await Promise.all([
      ctx.db.get(args.lostItemId),
      ctx.db.get(args.foundItemId),
    ]);

    if (!lostItem) {
      throw new Error("Lost item not found");
    }
    if (!foundItem) {
      throw new Error("Found item not found");
    }

    if (lostItem.found_item_id) {
      throw new Error("Lost item is already matched with another found item");
    }
    if (foundItem.lost_item_id) {
      throw new Error("Found item is already matched with another lost item");
    }

    await Promise.all([
      ctx.db.patch(args.lostItemId, {
        is_found: true,
        found_item_id: args.foundItemId,
      }),
      ctx.db.patch(args.foundItemId, {
        lost_item_id: args.lostItemId,
      }),
    ]);

    return {
      success: true,
      message: `Successfully matched Lost Item ${args.lostItemId} with Found Item ${args.foundItemId}`,
      lostItem: await ctx.db.get(args.lostItemId),
      foundItem: await ctx.db.get(args.foundItemId),
    };
  },
});

export const unmatchItems = mutation({
  args: {
    lostItemId: v.id("lost_items"),
    foundItemId: v.id("found_items"),
  },
  handler: async (ctx, args) => {
    const [lostItem, foundItem] = await Promise.all([
      ctx.db.get(args.lostItemId),
      ctx.db.get(args.foundItemId),
    ]);

    if (!lostItem) {
      throw new Error("Lost item not found");
    }
    if (!foundItem) {
      throw new Error("Found item not found");
    }

    if (
      lostItem.found_item_id !== args.foundItemId ||
      foundItem.lost_item_id !== args.lostItemId
    ) {
      throw new Error("Items are not matched together");
    }

    await Promise.all([
      ctx.db.patch(args.lostItemId, {
        is_found: false,
        found_item_id: undefined,
      }),
      ctx.db.patch(args.foundItemId, {
        lost_item_id: undefined,
      }),
    ]);

    return {
      success: true,
      message: `Successfully unmatched Lost Item ${args.lostItemId} from Found Item ${args.foundItemId}`,
      lostItem: await ctx.db.get(args.lostItemId),
      foundItem: await ctx.db.get(args.foundItemId),
    };
  },
});

export const updateLostItem = mutation({
  args: {
    id: v.id("lost_items"),
    name: v.optional(v.string()),
    details: v.optional(v.string()),
    location_lost: v.optional(v.string()),
    reporter_name: v.optional(v.string()),
    aims_number: v.optional(v.string()),
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

    const item = await ctx.db.get(id);
    if (!item) {
      throw new Error("Lost item not found");
    }

    await ctx.db.patch(id, cleanUpdates);
    return await ctx.db.get(id);
  },
});

export const updateFoundItem = mutation({
  args: {
    id: v.id("found_items"),
    name: v.optional(v.string()),
    details: v.optional(v.string()),
    location_found: v.optional(v.string()),
    finder_name: v.optional(v.string()),
    finder_aims_number: v.optional(v.string()),
    received_by: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No updates provided");
    }

    const item = await ctx.db.get(id);
    if (!item) {
      throw new Error("Found item not found");
    }

    await ctx.db.patch(id, cleanUpdates);
    return await ctx.db.get(id);
  },
});
