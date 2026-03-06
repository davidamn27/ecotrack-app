import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function toDateKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export const upsertCatalog = mutation({
  args: {
    items: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        category: v.string(),
        defaultPoints: v.number(),
        note: v.string(),
        isSystem: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const existing = await ctx.db
        .query("activities")
        .withIndex("by_key", (q) => q.eq("key", item.key))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: item.title,
          category: item.category,
          defaultPoints: item.defaultPoints,
          note: item.note,
          isSystem: item.isSystem,
        });
      } else {
        await ctx.db.insert("activities", {
          ...item,
          createdAt: Date.now(),
        });
      }
    }

    return { ok: true, count: args.items.length };
  },
});

export const addEntries = mutation({
  args: {
    userId: v.id("users"),
    entries: v.array(
      v.object({
        category: v.string(),
        title: v.string(),
        points: v.number(),
        note: v.string(),
        createdAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { ok: false, reason: "user_missing" };
    }

    for (const entry of args.entries) {
      const key = `${entry.category}:${entry.title}`.toLowerCase().trim();
      const catalogItem = await ctx.db
        .query("activities")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();

      await ctx.db.insert("activityEntries", {
        userId: args.userId,
        activityId: catalogItem?._id,
        category: entry.category,
        title: entry.title,
        points: entry.points,
        note: entry.note,
        dateKey: toDateKey(entry.createdAt),
        createdAt: entry.createdAt,
      });
    }

    return { ok: true, count: args.entries.length };
  },
});

export const getUserEntries = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityEntries")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getUserSummary = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const cutoff = now - (args.days ?? 30) * 24 * 60 * 60 * 1000;

    const rows = await ctx.db
      .query("activityEntries")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .collect();

    const filtered = rows.filter((row) => row.createdAt >= cutoff);
    const total = filtered.reduce((sum, row) => sum + row.points, 0);
    const byCategory = {};
    for (const row of filtered) {
      byCategory[row.category] = (byCategory[row.category] || 0) + row.points;
    }

    return {
      total,
      count: filtered.length,
      byCategory,
    };
  },
});
