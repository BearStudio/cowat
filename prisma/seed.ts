import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
async function main() {
  // Users
  const ivan = await prisma.user.findUnique({
    where: {
      email: "ivan@bearstudio.fr",
    },
  });

  const yoann = await prisma.user.findUnique({
    where: {
      email: "yoann@bearstudio.fr",
    },
  });

  // Locations
  const ivanLocationsCount = await prisma.location.count({
    where: {
      createdById: ivan?.id,
    },
  });

  if (ivanLocationsCount === 0) {
    await prisma.location.create({
      data: { address: "5 à Sec Darnétal", name: "Darnétal" },
    });
  }

  const ivanLocations = await prisma.location.findMany({
    where: {
      createdById: ivan?.id,
    },
  });

  const yoannLocationsCount = await prisma.location.count({
    where: {
      createdById: yoann?.id,
    },
  });

  if (yoannLocationsCount === 0) {
    await prisma.location.create({
      data: { address: "5 à Sec Darnétal", name: "Darnétal" },
    });
  }

  const yoannLocations = await prisma.location.findMany({
    where: {
      createdById: yoann?.id,
    },
  });

  // Create commutes with 1 location
  const newCommuteFromIvan = await prisma.commute.create({
    data: {
      seatsOutbound: 2,
      seatsReturn: 2,
      date: dayjs().add(3, "days").toDate(),
      returnTime: dayjs().add(3, "days").hour(18).minute(0).toDate(),
      stops: {
        create: ivanLocations[0] && {
          locationId: ivanLocations[0].id,
          time: "8:00",
        },
      },
      createdById: ivan?.id,
      commuteType: "ROUND",
    },
  });
  const newTodayCommuteFromIvan = await prisma.commute.create({
    data: {
      seatsReturn: 2,
      date: dayjs().toDate(),
      returnTime: dayjs().add(3, "days").hour(16).minute(0).toDate(),
      stops: {
        create: ivanLocations[0] && {
          locationId: ivanLocations[0].id,
          time: "8:00",
        },
      },
      createdById: ivan?.id,
      commuteType: "RETURN",
    },
    include: {
      stops: {
        select: { id: true },
      },
    },
  });
  const newCommuteFromYoann = await prisma.commute.create({
    data: {
      seatsOutbound: 2,
      date: dayjs().toDate(),
      returnTime: dayjs().add(3, "days").hour(17).minute(0).toDate(),
      stops: {
        create: yoannLocations[0] && {
          locationId: yoannLocations[0].id,
          time: "08:30",
        },
      },
      createdById: yoann?.id,
      commuteType: "OUTBOUND",
    },
    include: {
      stops: {
        select: { id: true },
      },
    },
  });

  // Deleted one to make sure it doesn't show in the interface
  const newDeletedFromYoann = await prisma.commute.create({
    data: {
      seatsOutbound: 2,
      date: dayjs().add(4, "days").toDate(),
      returnTime: dayjs().add(3, "days").hour(16).minute(30).toDate(),
      stops: {
        create: yoannLocations[0] && {
          locationId: yoannLocations[0].id,
          time: "8:30",
        },
      },
      createdById: yoann?.id,
      isDeleted: true,
      commuteType: "OUTBOUND",
    },
  });

  // Request from Ivan on Yoann's commute
  const ivanRequestOnYoannCommute = await prisma.passengersOnStops.create({
    data: {
      stopId: newCommuteFromYoann.stops[0]?.id ?? "",
      userId: ivan?.id ?? "",
    },
  });
  // Request from Ivan on Yoann's commute
  const yoannRequestOnIvanTodayCommute = await prisma.passengersOnStops.create({
    data: {
      stopId: newTodayCommuteFromIvan.stops[0]?.id ?? "",
      userId: yoann?.id ?? "",
    },
  });

  // Anonymize data if we are using a dump from the production.
  await prisma.location.updateMany({
    data: {
      address: faker.location.streetAddress(true),
      name: faker.company.name(),
    },
  });

  await prisma.commute.updateMany({
    where: {
      comment: {
        not: null,
      },
    },
    data: {
      comment: faker.lorem.lines(),
    },
  });

  console.log({
    newCommuteFromIvan,
    newTodayCommuteFromIvan,
    newCommuteFromYoann,
    newDeletedFromYoann,
    ivanRequestOnYoannCommute,
    yoannRequestOnIvanTodayCommute,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
