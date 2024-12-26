import type { Prisma } from "@prisma/client";

function sortStopsByTime(stops: Array<any>) {
  return stops.sort((a, b) => {
    const parseTime = (time: string | null): number => {
      if (!time) return 0;
      const [hours, minutes] = time.split(":").map(Number);
      if (
        hours === undefined ||
        minutes === undefined ||
        isNaN(hours) ||
        isNaN(minutes)
      ) {
        return 0;
      }
      return hours * 60 + minutes;
    };
    return parseTime(a.time) - parseTime(b.time);
  });
}

export const getSortedStops = (
  stops: Prisma.StopGetPayload<{
    select: {
      id: true;
      location: true;
      time: true;
    };
  }>[]
) => {
  return sortStopsByTime(stops);
};

export const getSortedStopsWithPassengers = (
  stops: Prisma.StopGetPayload<{
    include: {
      location: {
        select: {
          address: true;
          name: true;
        };
      };
      passengers: {
        include: {
          user: {
            select: {
              id: true;
              name: true;
              email: true;
              image: true;
            };
          };
        };
      };
    };
  }>[]
) => {
  return sortStopsByTime(stops);
};
