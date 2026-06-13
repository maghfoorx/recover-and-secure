import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc, Id } from "convex/_generated/dataModel";
import { getAll, getManyFrom } from "convex-helpers/server/relationships";

export const getAllAmaanatUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("amaanat_users").order("desc").collect();
  },
});

export const getAmaanatUser = query({
  args: { id: v.id("amaanat_users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserAmaanatItems = query({
  args: { userId: v.id("amaanat_users") },
  handler: async (ctx, args) => {
    const db = ctx.db;

    const items = await getManyFrom(
      db,
      "amaanat_items",
      "by_user",
      args.userId,
      "user_id",
    );

    const locationIds = items
      .map((item) => item.location_id)
      .filter((id): id is Id<"amaanat_locations"> => !!id);

    const locations = await getAll(db, locationIds);
    const areaIds = locations
      .filter((location): location is NonNullable<typeof location> => !!location)
      .map((location) => location.area_id)
      .filter((id): id is Id<"storage_areas"> => !!id);
    const areas = await getAll(db, areaIds);

    const cleanLocations = locations.filter((location) => !!location);
    const cleanAreas = areas.filter((area) => !!area);

    const locationMap = new Map(cleanLocations.map((loc) => [loc._id, loc]));
    const areaMap = new Map(cleanAreas.map((area) => [area._id, area]));

    return items.map((item) => {
      const location = item.location_id ? locationMap.get(item.location_id) : null;
      const area = location?.area_id ? areaMap.get(location.area_id) : null;

      return {
        ...item,
        locationNumber: location?.number ?? null,
        locationSize: location?.size ?? null,
        locationAreaName: area?.name ?? null,
        locationAreaCode: area?.code ?? null,
      };
    });
  },
});

export const getTotalAmaanatItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("amaanat_items").collect();
  },
});

export const getUnreturnedAmaanatItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("amaanat_items")
      .withIndex("by_returned_status", (q) => q.eq("is_returned", false))
      .collect();
  },
});

export const getReturnedAmaanatItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("amaanat_items")
      .withIndex("by_returned_status", (q) => q.eq("is_returned", true))
      .collect();
  },
});

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
