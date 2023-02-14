import { PrismaClient } from "@prisma/client";

import { env } from "../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

prisma.$use(async (params, next) => {
  // Check incoming query type
  if (params.model == "Location") {
    if (params.action === "delete") {
      // Delete queries
      // Change action to an update
      params.action = "update";
      params.args["data"] = { isDeleted: true };
    }

    if (params.action == "deleteMany") {
      // Delete many queries
      params.action = "updateMany";
      if (params.args.data !== undefined) {
        params.args.data["isDeleted"] = true;
      } else {
        params.args["data"] = { isDeleted: true };
      }
    }
  }
  return next(params);
});
