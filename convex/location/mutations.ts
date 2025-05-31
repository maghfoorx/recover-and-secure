import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createLocationsBatch = mutation({
  args: {
    from: v.number(),
    to: v.number(),
    size: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
  },
  handler: async (ctx, { from, to, size }) => {
    for (let number = from; number <= to; number++) {
      await ctx.db.insert("amaanat_locations", {
        number,
        size,
        is_occupied: false,
      });
    }
  },
});
