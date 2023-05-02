import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

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
      seats: 2,
      date: dayjs().add(3, "days").toDate(),
      stops: {
        create: {
          locationId: ivanLocations[0]?.id,
        },
      },
      createdById: ivan?.id,
    },
  });
  const newCommuteFromYoann = await prisma.commute.create({
    data: {
      seats: 3,
      date: dayjs().add(4, "days").toDate(),
      stops: {
        create: {
          locationId: yoannLocations[0]?.id,
        },
      },
      createdById: yoann?.id,
    },
  });
  // Deleted one to make sure it doesn't show in the interface
  const newDeletedFromYoann = await prisma.commute.create({
    data: {
      seats: 3,
      date: dayjs().add(4, "days").toDate(),
      stops: {
        create: {
          locationId: yoannLocations[0]?.id,
        },
      },
      createdById: yoann?.id,
      isDeleted: true,
    },
  });
  console.log({ newCommuteFromIvan, newCommuteFromYoann, newDeletedFromYoann });
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
