import type { Commute, PassengersOnStops } from "@prisma/client";
import dayjs from "dayjs";

type CommuteType = Commute;
type PassengerType = PassengersOnStops;
type PassengerWithCommuteDateType = PassengersOnStops & { commuteDate?: Date };

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

export const getYearBook = (commutes: CommuteType[]) => {
  return commutes.filter((commute) =>
    dayjs(commute.createdAt).isSame(dayjs(), "year")
  ).length;
};

export const getAllDrivenPeople = (passengers: PassengerType[]) => {
  return passengers.length;
};

export const getYearDrivenPeople = (
  passengers: PassengerWithCommuteDateType[]
) => {
  return passengers.filter((passenger) =>
    dayjs(passenger.commuteDate).isSame(dayjs(), "year")
  ).length;
};
