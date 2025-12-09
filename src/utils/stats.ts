import type { Commute } from "@prisma/client";

type CommuteType = Commute;

export const getAllCommute = (commutes: CommuteType[]) => {
  return commutes.length;
};

