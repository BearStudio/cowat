import type { Commute, PassengersOnStops } from "@prisma/client";
import dayjs from "dayjs";

type PassengerWithCommuteDateType = PassengersOnStops & { commuteDate?: Date };

const currentYear = dayjs().year();
const years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

export const getAll = (items: Commute[] | PassengersOnStops[]) => {
  return items.length;
};

export const getActualYear = (items: Commute[]) => {
  return items.filter((item) => dayjs(item.createdAt).isSame(dayjs(), "year"))
    .length;
};

export const getActualYearWithDate = (
  items: PassengerWithCommuteDateType[]
) => {
  return items.filter((item) => dayjs(item.commuteDate).isSame(dayjs(), "year"))
    .length;
};

export const getByYears = (items: Commute[]) => {
  return years.map((year) => ({
    year,
    value: items.filter((item) =>
      dayjs(item.createdAt).isSame(dayjs().year(year), "year")
    ).length,
    actualYear: year === currentYear,
  }));
};

export const getByYearsWithDate = (items: PassengerWithCommuteDateType[]) => {
  return years.map((year) => ({
    year,
    value: items.filter((item) =>
      dayjs(item.commuteDate).isSame(dayjs().year(year), "year")
    ).length,
    actualYear: year === currentYear,
  }));
};
