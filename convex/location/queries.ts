import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc } from "convex/_generated/dataModel";

// Get all available locations
export const getAvailableLocations = query({
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
        small: [] as Doc<"amaanat_locations">[],
        medium: [] as Doc<"amaanat_locations">[],
        large: [] as Doc<"amaanat_locations">[],
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
