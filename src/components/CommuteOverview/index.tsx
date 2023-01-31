import { api } from "@/utils/api";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

export type CommuteOverviewProps = Prisma.CommuteGetPayload<{
  include: {
    createdBy: true;
    stops: { include: { location: true; passengers: true } };
  };
}>;

export const CommuteOverview = (props: CommuteOverviewProps) => {
  const { data: session } = useSession();
  const ctx = api.useContext();

  const bookCommute = api.stop.book.useMutation({
    onSuccess: () => {
      ctx.commute.invalidate();
    },
  });

  const updateRequestStatus = api.stop.requestStatus.useMutation({
    onSuccess: () => {
      ctx.commute.invalidate();
    },
  });

  const passengerStop = props.stops.find((stop) =>
    stop.passengers.some(
      (passenger) =>
        passenger.userId === session?.user?.id &&
        passenger.requestStatus !== "CANCELED"
    )
  );

  const isPassenger = !!session?.user?.id && !!passengerStop;
  const passengerStatus = passengerStop?.passengers.find(
    (passenger) => passenger.userId === session?.user?.id
  )?.requestStatus;
  const isDriver =
    !!session?.user?.id && props.createdBy?.id === session?.user?.id;

  const getIsPassengerOnStop = (
    stop: CommuteOverviewProps["stops"][number]
  ) => {
    return (
      isPassenger &&
      stop.passengers.some(
        (passenger) =>
          passenger.userId === session?.user?.id &&
          passenger.requestStatus !== "CANCELED"
      )
    );
  };

  const isInThePast = dayjs(props.date).isBefore(dayjs().subtract(1, "day"));

  return (
    <Card boxShadow="card">
      <CardHeader pb={0}>
        <HStack>
          <Avatar
            size="sm"
            name={props.createdBy?.name ?? ""}
            src={props.createdBy?.image ?? ""}
          />
          <Stack spacing={0}>
            <HStack>
              <Text fontSize="sm" fontWeight="bold">
                {dayjs(props.date).format("dddd DD MMMM YYYY HH:mm")}
              </Text>
              {isInThePast && <Badge fontSize="x-small">Past commute</Badge>}
            </HStack>
            <Text fontSize="sm">
              {props.createdBy?.name ?? props.createdBy?.email}
            </Text>
            <Text fontSize="xs">{props.id}</Text>
          </Stack>
        </HStack>
      </CardHeader>
      <CardBody pt={2}>
        <Accordion allowToggle>
          <AccordionItem border="none">
            <AccordionButton p={0} _hover={{ bg: "none" }}>
              <AccordionIcon />
              {props.stops.length} stop{props.stops.length > 1 ? "s" : ""} ·{" "}
              {props.seats} seat{props.seats > 1 ? "s" : ""}
            </AccordionButton>
            <AccordionPanel p={0}>
              <Stack divider={<StackDivider />} spacing="4">
                <StackDivider />
                {props.stops.map((stop) => (
                  <HStack key={stop.id}>
                    <Stack spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="bold">
                        {!!stop.time && `${stop.time} · `}
                        {stop?.location?.name}{" "}
                      </Text>
                      <Text fontSize="sm">{stop?.location?.address}</Text>
                    </Stack>
                    {!isDriver &&
                      (!isPassenger || passengerStatus === "CANCELED") && (
                        <HStack>
                          <Button
                            colorScheme="brand"
                            onClick={() =>
                              bookCommute.mutate({ stopId: stop.id })
                            }
                            isLoading={bookCommute.isLoading}
                          >
                            Book
                          </Button>
                        </HStack>
                      )}
                    {isPassenger &&
                      getIsPassengerOnStop(stop) &&
                      (passengerStatus === "REQUESTED" ||
                        passengerStatus === "ACCEPTED") && (
                        <HStack>
                          <Button
                            colorScheme="red"
                            onClick={() =>
                              updateRequestStatus.mutate({
                                stopId: stop.id,
                                passengerId: session.user?.id as string,
                                requestStatus: "CANCELED",
                              })
                            }
                            isLoading={updateRequestStatus.isLoading}
                          >
                            Cancel
                          </Button>
                        </HStack>
                      )}
                  </HStack>
                ))}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};
