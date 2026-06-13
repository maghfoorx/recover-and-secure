import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc } from "convex/_generated/dataModel";

export const getAvailableLocations = query({
  args: {
    userId: v.optional(v.id("amaanat_users")),
  },
  handler: async (ctx, args) => {
    const db = ctx.db;

    const allLocations = await db.query("amaanat_locations").collect();
    const allAreas = await db.query("storage_areas").collect();
    const areaMap = new Map(allAreas.map((area) => [area._id, area]));

    const occupiedLocations = await db
      .query("amaanat_items")
      .filter((q) => q.eq(q.field("is_returned"), false))
      .collect();

    const locationUserMap = new Map();
    occupiedLocations.forEach((item) => {
      locationUserMap.set(item.location_id, item.user_id);
    });

    const availableLocations = allLocations.filter((location) => {
      const occupyingUserId = locationUserMap.get(location._id);
      return (
        !occupyingUserId || (args.userId && occupyingUserId === args.userId)
      );
    });

    const locationsBySize = {
      x_small: availableLocations
        .filter((loc) => loc.size === "x_small")
        .map((loc) => ({
          ...loc,
          area_name: loc.area_id ? (areaMap.get(loc.area_id)?.name ?? null) : null,
          area_code: loc.area_id ? (areaMap.get(loc.area_id)?.code ?? null) : null,
        })),
      small: availableLocations
        .filter((loc) => loc.size === "small")
        .map((loc) => ({
          ...loc,
          area_name: loc.area_id ? (areaMap.get(loc.area_id)?.name ?? null) : null,
          area_code: loc.area_id ? (areaMap.get(loc.area_id)?.code ?? null) : null,
        })),
      medium: availableLocations
        .filter((loc) => loc.size === "medium")
        .map((loc) => ({
          ...loc,
          area_name: loc.area_id ? (areaMap.get(loc.area_id)?.name ?? null) : null,
          area_code: loc.area_id ? (areaMap.get(loc.area_id)?.code ?? null) : null,
        })),
      large: availableLocations
        .filter((loc) => loc.size === "large")
        .map((loc) => ({
          ...loc,
          area_name: loc.area_id ? (areaMap.get(loc.area_id)?.name ?? null) : null,
          area_code: loc.area_id ? (areaMap.get(loc.area_id)?.code ?? null) : null,
        })),
      x_large: availableLocations
        .filter((loc) => loc.size === "x_large")
        .map((loc) => ({
          ...loc,
          area_name: loc.area_id ? (areaMap.get(loc.area_id)?.name ?? null) : null,
          area_code: loc.area_id ? (areaMap.get(loc.area_id)?.code ?? null) : null,
        })),
      bulky_storage: availableLocations
        .filter((loc) => loc.size === "bulky_storage")
        .map((loc) => ({
          ...loc,
          area_name: loc.area_id ? (areaMap.get(loc.area_id)?.name ?? null) : null,
          area_code: loc.area_id ? (areaMap.get(loc.area_id)?.code ?? null) : null,
        })),
    };

    return locationsBySize;
  },
});

export const getStorageAreas = query({
  args: {},
  handler: async (ctx) => {
    const [areas, locations] = await Promise.all([
      ctx.db.query("storage_areas").withIndex("by_active", (q) => q.eq("is_active", true)).collect(),
      ctx.db.query("amaanat_locations").collect(),
    ]);

    return areas
      .map((area) => ({
        ...area,
        locationCount: locations.filter((location) => location.area_id === area._id)
          .length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getAllLocations = query({
  args: {},
  handler: async (ctx, args) => {
    const allAvailable = await ctx.db
      .query("amaanat_locations")
      // .filter((q) => q.eq(q.field("is_occupied"), false))
      .order("asc")
      .collect();

    // Group by size
    const grouped = allAvailable.reduce(
      (acc, loc) => {
        acc[loc.size].push(loc);
        return acc;
      },
      {
        x_small: [] as Doc<"amaanat_locations">[],
        small: [] as Doc<"amaanat_locations">[],
        medium: [] as Doc<"amaanat_locations">[],
        large: [] as Doc<"amaanat_locations">[],
        x_large: [] as Doc<"amaanat_locations">[],
        bulky_storage: [] as Doc<"amaanat_locations">[],
      },
    );

    return grouped;
  },
});

export const getLatestLocationNumber = query({
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("amaanat_locations")
      .order("desc")
      .take(1);

    return latest[0]?.number ?? 0;
  },
});
