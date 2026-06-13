import { mutation } from "../_generated/server";
import { v } from "convex/values";

function normalizeAreaName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function normalizeAreaCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export const createStorageArea = mutation({
  args: {
    name: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const name = normalizeAreaName(args.name);
    const code = normalizeAreaCode(args.code);

    if (!name) {
      throw new Error("Area name is required");
    }

    if (!code) {
      throw new Error("Area code is required");
    }

    const existingCode = await ctx.db
      .query("storage_areas")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (existingCode) {
      throw new Error(`Code "${code}" is already used by ${existingCode.name}`);
    }

    const existingName = await ctx.db
      .query("storage_areas")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (existingName) {
      throw new Error(`Area "${name}" already exists`);
    }

    return await ctx.db.insert("storage_areas", {
      name,
      code,
      is_active: true,
    });
  },
});

export const createLocationsBatch = mutation({
  args: {
    from: v.number(),
    to: v.number(),
    areaId: v.id("storage_areas"),
    size: v.union(
      v.literal("x_small"),
      v.literal("small"),
      v.literal("medium"),
      v.literal("large"),
      v.literal("x_large"),
      v.literal("bulky_storage"),
    ),
  },
  handler: async (ctx, { from, to, areaId, size }) => {
    const area = await ctx.db.get(areaId);

    if (!area || !area.is_active) {
      throw new Error("Please select a valid area");
    }

    for (let number = from; number <= to; number++) {
      await ctx.db.insert("amaanat_locations", {
        number,
        area_id: areaId,
        size,
        is_occupied: false,
      });
    }
  },
});
