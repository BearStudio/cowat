import { createTRPCRouter } from "./trpc";
import { stopRouter } from "./routers/stop";
import { commuteRouter } from "./routers/commute";
import { locationRouter } from "./routers/locations";
import { userRouter } from "@/server/api/routers/user";
import { templateRouter } from "@/server/api/routers/templates";
import { adminRouter } from "@/server/api/routers/admin";
import { driverRouter } from "@/server/api/routers/driver";
import { passengerRouter } from "@/server/api/routers/passenger";
import { subscriptionRouter } from "@/server/api/routers/subscription";

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
  template: templateRouter,
  admin: adminRouter,
  driver: driverRouter,
  passenger: passengerRouter,
  subscription: subscriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
