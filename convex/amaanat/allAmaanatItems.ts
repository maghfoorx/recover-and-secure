import { query } from "../_generated/server";

export const getAllAmaanatItems = query({
  args: {},
  handler: async (ctx) => {
    return ["hello", "hello", "hello"];
  },
});
