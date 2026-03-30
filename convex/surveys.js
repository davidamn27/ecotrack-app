import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const responses = await ctx.db.query("surveyResponses").collect();
    const withUsers = await Promise.all(
      responses.map(async (response) => {
        const user = await ctx.db.get(response.userId);
        return {
          _id: response._id,
          userId: response.userId,
          userName: user?.name || "Unbekannt",
          userEmail: user?.email || "",
          overallRating: response.overallRating,
          usabilityRating: response.usabilityRating,
          designRating: response.designRating,
          recommendationRating: response.recommendationRating,
          comment: response.comment,
          createdAt: response.createdAt,
        };
      }),
    );

    return withUsers.sort((left, right) => right.createdAt - left.createdAt);
  },
});
