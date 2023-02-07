import { createTRPCRouter } from "./trpc";
import { stopRouter } from "./routers/stop";
import { commuteRouter } from "./routers/commute";
import { locationRouter } from "./routers/locations";
import { userRouter } from "@/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  stop: stopRouter,
  commute: commuteRouter,
  location: locationRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
