import { type NextPage } from "next";
import Head from "next/head";

import { Heading, Skeleton, Stack } from "@chakra-ui/react";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { CommuteOverview } from "@/components/CommuteOverview";

const Home: NextPage = () => {
  const myBookings = api.commute.myBookings.useQuery();
  const commutes = api.commute.todayCommutes.useQuery();

  return (
    <LayoutAuthenticated>
      <Head>
        <title>Cowat</title>
        <meta
          name="description"
          content="Cowat - Profesionnal car sharing made easy"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Stack spacing="8">
        <Heading>My Bookings</Heading>

        <Stack>
          {myBookings.isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton height="8.5rem" rounded="md" key={index} />
            ))}
          {!myBookings.isLoading &&
            myBookings.data?.map((commute) => (
              <CommuteOverview key={commute.id} {...commute} />
            ))}
        </Stack>

        <Heading>Today&apos;s commutes</Heading>

        <Stack>
          {commutes.isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton height="8.5rem" rounded="md" key={index} />
            ))}
          {!commutes.isLoading &&
            commutes.data?.map((commute) => (
              <CommuteOverview key={commute.id} {...commute} />
            ))}
        </Stack>
      </Stack>
    </LayoutAuthenticated>
  );
};

export default Home;
