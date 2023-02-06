import { Icon } from "@/components/Icon";
import { api } from "@/utils/api";
import { getPassengers } from "@/utils/commutes";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Stack,
  StackDivider,
  Tag,
  Text,
  Wrap,
} from "@chakra-ui/react";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { CheckCircle2, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

export type CommuteOverviewProps = Prisma.CommuteGetPayload<{
  include: {
    createdBy: true;
    stops: {
      include: { location: true; passengers: { include: { user: true } } };
    };
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
  const isCurrentUserDriver =
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

  const passengers = getPassengers(props.stops);
  const commuteColorScheme = () => {
    if (isCurrentUserDriver) {
      return "brand";
    }

    if (passengerStatus === "ACCEPTED") {
      return "success";
    }

    if (passengerStatus === "REQUESTED") {
      return "warning";
    }

    return "gray";
  };

  return (
    <Card
      position="relative"
      borderStart="6px solid"
      borderColor={`${commuteColorScheme()}.500`}
      boxShadow="card"
    >
      <CardHeader pb={0}>
        <Flex justify="space-between">
          <HStack>
            <Avatar
              size="md"
              borderRadius="md"
              name={props.createdBy?.name ?? ""}
              src={props.createdBy?.image ?? ""}
            />
            <Stack spacing={0}>
              <HStack>
                <Text fontSize="sm" fontWeight="bold">
                  {dayjs(props.date).format("dddd DD MMM HH:mm")}
                </Text>
              </HStack>
              <Text fontSize="sm">
                {props.createdBy?.name ?? props.createdBy?.email}
              </Text>
            </Stack>
          </HStack>
          <AvatarGroup size="sm" max={3}>
            {passengers.map((passenger) => (
              <Avatar
                key={passenger.id}
                src={passenger.image ?? ""}
                name={passenger.name ?? passenger.email ?? ""}
                border="2px solid white"
              />
            ))}
          </AvatarGroup>
        </Flex>
      </CardHeader>
      <CardBody pt={2}>
        <Accordion allowToggle>
          <AccordionItem border="none">
            <AccordionButton
              p={0}
              _hover={{ bg: "none" }}
              // Allows to click on the full card
              _before={{
                content: '""',
                position: "absolute",
                background: "transparent",
                inset: 0,
              }}
            >
              <Flex flex="1" align="center" justify="space-between">
                <Flex align="center">
                  <AccordionIcon />
                  <Text fontWeight="medium" fontSize="sm">
                    {props.stops.length} stop{props.stops.length > 1 ? "s" : ""}{" "}
                    · {passengers.length}/{props.seats} seat
                    {props.seats > 1 ? "s" : ""}
                  </Text>
                </Flex>
                {passengerStatus === "ACCEPTED" && (
                  <Badge colorScheme="success" variant="solid">
                    Passenger <Icon icon={CheckCircle2} />
                  </Badge>
                )}
                {passengerStatus === "REQUESTED" && (
                  <Badge colorScheme="warning" variant="solid">
                    Passenger <Icon icon={Clock} />
                  </Badge>
                )}
                {isCurrentUserDriver && (
                  <Badge colorScheme="brand" variant="solid">
                    Driver
                  </Badge>
                )}
              </Flex>
            </AccordionButton>
            <AccordionPanel p={0}>
              <Stack divider={<StackDivider />} spacing="4">
                <StackDivider />
                {props.stops.map((stop) => {
                  const passengers = stop.passengers.filter(
                    (passenger) => passenger.requestStatus !== "CANCELED"
                  );
                  return (
                    <HStack key={stop.id}>
                      <Stack spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="bold">
                          {!!stop.time && `${stop.time} · `}
                          {stop?.location?.name}{" "}
                        </Text>
                        <Text fontSize="sm">{stop?.location?.address}</Text>
                        {!!passengers.length && (
                          <Wrap pt="1">
                            {passengers.map((passenger) => (
                              <Tag
                                size="sm"
                                key={passenger.userId}
                                colorScheme={
                                  passenger.requestStatus === "ACCEPTED"
                                    ? "success"
                                    : passenger.requestStatus === "REFUSED"
                                    ? "error"
                                    : undefined
                                }
                              >
                                {passenger.user.name ?? passenger.user.email}
                              </Tag>
                            ))}
                          </Wrap>
                        )}
                      </Stack>
                      {!isCurrentUserDriver &&
                        (!isPassenger || passengerStatus === "CANCELED") && (
                          <HStack>
                            <Button
                              variant="primary"
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
                  );
                })}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};
