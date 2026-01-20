import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import {
  getAll,
  getActualYear,
  getActualYearWithDate,
  getByYears,
  getByYearsWithDate,
} from "@/utils/stats";
import {
  Center,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { ChatWithStats } from "@/components/ChatWithStats";

const StatsPage = () => {
  const profile = api.user.profile.useQuery();
  const commuteStats = api.commute.allCommutesStats.useQuery();
  const bookedStats = api.commute.allBookStats.useQuery();
  const drivenPeopleStats = api.commute.allDrivenPeopleStats.useQuery();

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <HStack>
          <IconButton
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            as={Link}
            href="/account"
          />
          <Heading size="md">Statistics</Heading>
        </HStack>
      }
    >
      <Head>
        <title>Cowat - Statistics</title>
      </Head>
      {profile.isLoading && (
        <Center flex={1}>
          <Spinner />
        </Center>
      )}
      <Flex direction="column" gap="6" as="main">
        <ChatWithStats
          label="Commutes"
          chartData={getByYears(commuteStats.data || [])}
          allTimeData={commuteStats.data && getAll(commuteStats.data)}
          thisYearData={commuteStats.data && getActualYear(commuteStats.data)}
        />
        <ChatWithStats
          label="Booked commutes"
          chartData={getByYears(bookedStats.data || [])}
          allTimeData={bookedStats.data && getAll(bookedStats.data)}
          thisYearData={bookedStats.data && getActualYear(bookedStats.data)}
        />
        <ChatWithStats
          label="Driven people"
          chartData={getByYearsWithDate(drivenPeopleStats.data || [])}
          allTimeData={drivenPeopleStats.data && getAll(drivenPeopleStats.data)}
          thisYearData={
            drivenPeopleStats.data &&
            getActualYearWithDate(drivenPeopleStats.data)
          }
        />
      </Flex>
    </LayoutAuthenticated>
  );
};

export default StatsPage;
