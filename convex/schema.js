import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    city: v.string(),
    age: v.string(),
    password: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  appStates: defineTable({
    name: v.string(),
    state: v.any(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  activities: defineTable({
    key: v.string(),
    title: v.string(),
    category: v.string(),
    defaultPoints: v.number(),
    note: v.string(),
    isSystem: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_category", ["category"]),

  activityEntries: defineTable({
    userId: v.id("users"),
    activityId: v.optional(v.id("activities")),
    category: v.string(),
    title: v.string(),
    points: v.number(),
    note: v.string(),
    dateKey: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_date", ["userId", "dateKey"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_date", ["dateKey"])
    .index("by_category_date", ["category", "dateKey"]),
});
