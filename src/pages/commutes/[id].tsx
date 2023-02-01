import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import type { PassengersOnStops, Stop, User } from "@prisma/client";
import { RequestStatusColorSchemes } from "@/utils/requestStatus";

type StopWithPassengers = Stop & {
  passengers: Array<
    PassengersOnStops & {
      user: User;
    }
  >;
};

const CommutesIndex: NextPage = () => {
  const { query, push } = useRouter();
  const { data } = useSession();

  const ctx = api.useContext();

  const id = query.id ? query.id.toString() : "";

  const commute = api.commute.commute.useQuery(
    { id },
    {
      enabled: !!id,
    }
  );

  const bookCommute = api.stop.book.useMutation({
    onSuccess: () => {
      ctx.stop.invalidate();
      push("/commutes");
    },
  });

  const updateRequestStatus = api.stop.requestStatus.useMutation({
    onSuccess: () => {
      ctx.commute.invalidate();
      ctx.stop.invalidate();
    },
  });

  const doesPassengersBookedTheStop = (stop: StopWithPassengers) => {
    return stop.passengers
      .map((passenger) => passenger.userId)
      .includes(data?.user?.id ?? "");
  };

  return (
    <LayoutAuthenticated topBar={<Heading>Commute details</Heading>}>
      {commute.isLoading && <CircularProgress isIndeterminate />}
      {!commute?.isLoading && (
        <Stack spacing="4">
          <Box>
            <Text>Nombre de places disponible: {commute.data?.seats}</Text>
          </Box>
          {commute.data?.stops?.map((stop) => (
            <Stack key={stop.id}>
              <Flex gap="8" justifyContent="space-between">
                <Box flex="1">
                  <Text as="address">
                    {stop.location?.name} - {stop.location?.address}
                  </Text>
                </Box>
                {commute.data.createdById !== data?.user?.id &&
                  !doesPassengersBookedTheStop(stop) && (
                    <Box>
                      <Button
                        isLoading={bookCommute.isLoading}
                        onClick={() => bookCommute.mutate({ stopId: stop.id })}
                      >
                        {doesPassengersBookedTheStop(stop)
                          ? stop.passengers.find(
                              (passenger) => passenger.userId === data?.user?.id
                            )?.requestStatus
                          : "Book"}
                      </Button>
                    </Box>
                  )}
              </Flex>

              <Stack>
                <Text>Passengers ({stop.passengers.length}):</Text>

                {stop.passengers.map((passenger) => (
                  <Flex
                    key={passenger.userId}
                    justify="space-between"
                    align="center"
                  >
                    <Text>{passenger.user.email}</Text>
                    <Badge
                      colorScheme={
                        RequestStatusColorSchemes[passenger.requestStatus]
                      }
                    >
                      {passenger.requestStatus}
                    </Badge>
                    {data?.user?.id === commute.data.createdById && (
                      <HStack>
                        <Button
                          size="sm"
                          colorScheme="success"
                          isLoading={updateRequestStatus.isLoading}
                          isDisabled={passenger.requestStatus === "ACCEPTED"}
                          onClick={() =>
                            updateRequestStatus.mutate({
                              stopId: passenger.stopId,
                              passengerId: passenger.userId,
                              requestStatus: "ACCEPTED",
                            })
                          }
                        >
                          ACCEPT
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="error"
                          isLoading={updateRequestStatus.isLoading}
                          isDisabled={passenger.requestStatus === "REFUSED"}
                          onClick={() =>
                            updateRequestStatus.mutate({
                              stopId: passenger.stopId,
                              passengerId: passenger.userId,
                              requestStatus: "REFUSED",
                            })
                          }
                        >
                          REFUSE
                        </Button>
                      </HStack>
                    )}
                  </Flex>
                ))}
              </Stack>
            </Stack>
          ))}
          <Box>
            <Text fontSize="sm" color="gray.600">
              By {commute.data?.createdBy?.name} for{" "}
              {dayjs(commute.data?.date).format("DD MM YYYY")}
            </Text>
          </Box>
        </Stack>
      )}
    </LayoutAuthenticated>
  );
};

export default CommutesIndex;
