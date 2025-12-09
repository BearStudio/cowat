import type { Commute } from "@prisma/client";
import dayjs from "dayjs";

type CommuteType = Commute;

export const getAllCommute = (commutes: CommuteType[]) => {
  return commutes.length;
};

export const getYearCommute = (commutes: CommuteType[]) => {
  return commutes.filter((commute) =>
    dayjs(commute.createdAt).isSame(dayjs(), "year")
  ).length;
};

export const getAllBook = (commutes: CommuteType[]) => {
  return commutes.length;
};
