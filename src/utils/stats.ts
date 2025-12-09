import type { Commute, PassengersOnStops } from "@prisma/client";
import dayjs from "dayjs";

type PassengerWithCommuteDateType = PassengersOnStops & { commuteDate?: Date };

export const getAll = (items: Commute[] | PassengersOnStops[]) => {
  return items.length;
};

export const getYear = (items: Commute[]) => {
  return items.filter((item) => dayjs(item.createdAt).isSame(dayjs(), "year"))
    .length;
};

export const getYearWithDate = (items: PassengerWithCommuteDateType[]) => {
  return items.filter((item) => dayjs(item.commuteDate).isSame(dayjs(), "year"))
    .length;
};
