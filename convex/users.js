import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    city: v.string(),
    age: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (existing) {
      return { ok: false, reason: "account_exists" };
    }

    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      email: normalizedEmail,
      city: args.city.trim(),
      age: String(args.age).trim(),
      password: args.password,
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(userId);
    return { ok: true, user };
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();

    if (!user) {
      return { ok: false, reason: "email_incorrect" };
    }

    if (user.password !== args.password) {
      return { ok: false, reason: "credentials_incorrect" };
    }

    return { ok: true, user };
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    city: v.string(),
    age: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.userId);
    if (!existing) {
      return { ok: false, reason: "user_missing" };
    }

    const normalizedEmail = args.email.trim().toLowerCase();
    const emailOwner = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .unique();
    if (emailOwner && emailOwner._id !== args.userId) {
      return { ok: false, reason: "account_exists" };
    }

    await ctx.db.patch(args.userId, {
      name: args.name.trim(),
      email: normalizedEmail,
      city: args.city.trim(),
      age: String(args.age).trim(),
    });

    return { ok: true, user: await ctx.db.get(args.userId) };
  },
});

export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { ok: false, reason: "user_missing" };
    }

    if (user.password !== args.currentPassword) {
      return { ok: false, reason: "current_password_wrong" };
    }

    await ctx.db.patch(args.userId, {
      password: args.newPassword,
    });

    return { ok: true, user: await ctx.db.get(args.userId) };
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { ok: false, reason: "user_missing" };
    }

    await ctx.db.delete(args.userId);
    return { ok: true };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
