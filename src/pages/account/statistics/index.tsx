import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import {
  getAllBook,
  getAllCommute,
  getAllDrivenPeople,
  getYearBook,
  getYearCommute,
  getYearDrivenPeople,
} from "@/utils/stats";
import {
  Center,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import Head from "next/head";
import Link from "next/link";

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
      )}{" "}
      <Stack
        spacing="4"
        as="main"
        boxShadow="card"
        p="4"
        bg="white"
        rounded="md"
        _dark={{
          bg: "gray.800",
        }}
      >
        <Flex flex={1} direction={"column"} gap={6}>
          <Stack>
            <Text fontWeight="bold">All</Text>
            <Text>
              Commutes : {commuteStats.data && getAllCommute(commuteStats.data)}
            </Text>
            <Text>
              Booked commutes :{" "}
              {bookedStats.data && getAllBook(bookedStats.data)}
            </Text>
            <Text>
              Driven people :{" "}
              {drivenPeopleStats.data &&
                getAllDrivenPeople(drivenPeopleStats.data)}
            </Text>
          </Stack>
          <Stack>
            <Text fontWeight="bold">This year</Text>
            <Text>
              Commutes :{" "}
              {commuteStats.data && getYearCommute(commuteStats.data)}
            </Text>
            <Text>
              Booked commutes :{" "}
              {bookedStats.data && getYearBook(bookedStats.data)}
            </Text>
            <Text>
              Driven people:{" "}
              {drivenPeopleStats.data &&
                getYearDrivenPeople(drivenPeopleStats.data)}
            </Text>
          </Stack>
        </Flex>
      </Stack>
    </LayoutAuthenticated>
  );
};

export default StatsPage;
