import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CircularProgress,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import type { NextPage } from "next";
import NextLink from "next/link";
import { FaCar } from "react-icons/fa";
import { FiNavigation, FiPlus } from "react-icons/fi";

const CommutesIndex: NextPage = () => {
  const myCommutes = api.commute.myCommute.useQuery();
  const communityCommutes = api.commute.communityCommutes.useQuery();

  return (
    <LayoutAuthenticated>
      <Stack spacing="16">
        {myCommutes.isLoading && <CircularProgress />}
        {!myCommutes.isLoading && (
          <Stack spacing="4">
            <Flex justify="space-between">
              <Heading size="lg">My Commutes</Heading>
              <Button
                as={NextLink}
                href="/commutes/new"
                leftIcon={<Icon icon={FiPlus} />}
              >
                Create
              </Button>
            </Flex>
            {myCommutes.data?.length === 0 && (
              <EmptyState>You have no commute at the moment</EmptyState>
            )}
            {myCommutes.data?.map((commute) => (
              <Flex direction="column" align="start" key={commute.id}>
                <Button
                  as={NextLink}
                  href={`/commutes/${commute.id}`}
                  variant="link"
                >
                  {commute.id} - {commute.seats} - {commute.status}
                </Button>

                <Box>
                  {commute.stops.map((stop) => (
                    <div key={stop.location?.id}>{stop.location?.address}</div>
                  ))}
                </Box>
              </Flex>
            ))}
          </Stack>
        )}

        {communityCommutes.isLoading && <CircularProgress />}
        {!communityCommutes.isLoading && (
          <Stack spacing="4">
            <Flex justify="space-between">
              <Heading size="lg">Community Commutes</Heading>
            </Flex>
            {communityCommutes.data?.length === 0 && (
              <EmptyState>No community commutes at the moment</EmptyState>
            )}
            {communityCommutes.data?.map((commute) => (
              <Card key={commute.id}>
                <CardHeader>
                  <Flex gap="4">
                    <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
                      <Avatar
                        name={commute.createdBy?.name ?? ""}
                        src={commute.createdBy?.image ?? ""}
                      />

                      <Box>
                        <Heading
                          size="sm"
                          as="time"
                          dateTime={commute.date.toISOString()}
                        >
                          {dayjs(commute.date).format("dddd DD MMMM YYYY")}
                        </Heading>
                        <Text>{commute.createdBy?.name}</Text>
                      </Box>
                    </Flex>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Box>
                    {commute.stops.map((stop) => (
                      <HStack key={stop.location?.id}>
                        <Text as="address">{stop.location?.address}</Text>
                        <Text>
                          (
                          {
                            stop.passengers.filter(
                              (passenger) =>
                                passenger.requestStatus === "ACCEPTED"
                            ).length
                          }{" "}
                          passenger)
                        </Text>
                      </HStack>
                    ))}
                  </Box>
                </CardBody>
                <CardFooter justify="space-between" flexWrap="wrap">
                  <Button
                    flex="1"
                    variant="ghost"
                    leftIcon={<FaCar />}
                    as={NextLink}
                    href={`/commutes/${commute.id}`}
                  >
                    {commute.seats} seat{commute.seats > 1 ? "s" : ""}
                  </Button>
                  <Button
                    flex="1"
                    variant="ghost"
                    leftIcon={<FiNavigation />}
                    as={NextLink}
                    href={`/commutes/${commute.id}`}
                  >
                    {commute.stops.length} stop
                    {commute.stops.length > 1 ? "s" : ""}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </LayoutAuthenticated>
  );
};

export default CommutesIndex;
