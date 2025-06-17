import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc } from "convex/_generated/dataModel";

// Updated query to get available locations (locations not occupied by other users)
export const getAvailableLocations = query({
  args: {
    userId: v.optional(v.id("amaanat_users")),
  },
  handler: async (ctx, args) => {
    const db = ctx.db;

    // Get all locations
    const allLocations = await db.query("amaanat_locations").collect();

    // Get all unreturned items with location info
    const occupiedLocations = await db
      .query("amaanat_items")
      .filter((q) => q.eq(q.field("is_returned"), false))
      .collect();

    // Create a map of location_id to user_id for occupied locations
    const locationUserMap = new Map();
    occupiedLocations.forEach((item) => {
      locationUserMap.set(item.location_id, item.user_id);
    });

    // Filter locations - available if unoccupied OR occupied by the same user
    const availableLocations = allLocations.filter((location) => {
      const occupyingUserId = locationUserMap.get(location._id);
      return (
        !occupyingUserId || (args.userId && occupyingUserId === args.userId)
      );
    });

    // Group by size
    const locationsBySize = {
      x_small: availableLocations.filter((loc) => loc.size === "x_small"),
      small: availableLocations.filter((loc) => loc.size === "small"),
      medium: availableLocations.filter((loc) => loc.size === "medium"),
      large: availableLocations.filter((loc) => loc.size === "large"),
      x_large: availableLocations.filter((loc) => loc.size === "x_large"),
    };

    return locationsBySize;
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
