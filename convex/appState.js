import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appStates")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
  },
});

export const save = mutation({
  args: {
    name: v.string(),
    state: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("appStates")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { state: args.state, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("appStates", {
      name: args.name,
      state: args.state,
      updatedAt: now,
    });
  },
});
