import { Icon } from "@/components/Icon";
import { FULL_TEXT_DATE_WITH_TIME } from "@/constants/dates";
import { api } from "@/utils/api";
import { getPassengers } from "@/utils/commutes";
import {
  chakra,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  AvatarGroup,
  Badge,
  Box,
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
import { ConfirmModal } from "../ConfirmModal";

export type CommuteOverviewProps = Prisma.CommuteGetPayload<{
  include: {
    createdBy: true;
    stops: {
      include: { location: true; passengers: { include: { user: true } } };
    };
  };
}> & {
  onBooked?: () => void;
};

export const CommuteOverview = (props: CommuteOverviewProps) => {
  const { data: session } = useSession();
  const ctx = api.useContext();

  const bookCommute = api.stop.book.useMutation({
    onSuccess: async () => {
      await ctx.commute.invalidate();
      props.onBooked?.();
    },
  });

  const updateRequestStatus = api.stop.requestStatus.useMutation({
    onSuccess: async () => {
      await ctx.commute.invalidate();
      await ctx.stop.invalidate();
    },
  });

  const cancelCommute = api.commute.cancelCommute.useMutation({
    onSuccess: async () => {
      await ctx.commute.invalidate();
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
  const commuteColor = (() => {
    if (props.isDeleted) {
      return "error.500";
    }

    if (isCurrentUserDriver) {
      return "brand.500";
    }

    if (passengerStatus === "ACCEPTED") {
      return "success.500";
    }

    if (passengerStatus === "REQUESTED") {
      return "warning.500";
    }

    return "gray.300";
  })();

  return (
    <Card
      position="relative"
      borderStart="6px solid"
      borderColor={commuteColor}
      boxShadow="card"
      overflow="hidden"
    >
      <CardHeader pb={0} zIndex={1} position="relative">
        {(isPassenger || isCurrentUserDriver) && (
          <Box
            position="absolute"
            top={12}
            right={-8}
            borderRadius="full"
            w={32}
            h={32}
            bg={commuteColor}
            opacity={0.6}
            filter="blur(80px)"
            blendMode="multiply"
          />
        )}
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
                  {dayjs(props.date).format(FULL_TEXT_DATE_WITH_TIME)}
                </Text>
              </HStack>
              <Text fontSize="sm">
                {props.createdBy?.name ?? props.createdBy?.email}{" "}
                {!!props.createdBy?.phone && <>· {props.createdBy?.phone}</>}
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
      <CardBody pt={2} zIndex={2}>
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
              <Stack spacing="0" w="full">
                <Flex flex="1" align="center" justify="space-between">
                  <Flex align="center">
                    <AccordionIcon />
                    <Text fontWeight="medium" fontSize="sm">
                      {props.stops.length} stop
                      {props.stops.length > 1 ? "s" : ""} · {passengers.length}/
                      {props.seats} seat
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
                  {isCurrentUserDriver && !props.isDeleted && (
                    <Badge colorScheme="brand" variant="solid">
                      Driver
                    </Badge>
                  )}
                  {props.isDeleted && (
                    <Badge colorScheme="error" variant="solid">
                      Canceled
                    </Badge>
                  )}
                </Flex>
              </Stack>
            </AccordionButton>
            <AccordionPanel p={0}>
              <Stack
                divider={<StackDivider borderColor="blackAlpha.100" />}
                spacing="4"
              >
                <StackDivider />
                {props.comment && (
                  <>
                    <Text fontSize="xs" textAlign="left" color="gray.500">
                      {props.comment}
                    </Text>

                    <StackDivider />
                  </>
                )}

                {props.stops.map((stop) => {
                  const passengers = stop.passengers.filter(
                    (passenger) => passenger.requestStatus !== "CANCELED"
                  );
                  return (
                    <HStack key={stop.id}>
                      <Stack spacing={0} flex={1}>
                        <Text fontSize="sm" fontWeight="bold">
                          📍 {!!stop.time && `${stop.time} · `}
                          {stop?.location?.name}{" "}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {stop?.location?.address}
                        </Text>
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
                        (!isPassenger ||
                          passengerStatus === "CANCELED" ||
                          passengerStatus === "REFUSED") &&
                        dayjs().isBefore(dayjs(props.date)) && (
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
                {isCurrentUserDriver && !props.isDeleted && (
                  <Flex>
                    <ConfirmModal
                      onConfirm={() => {
                        cancelCommute.mutate({ id: props.id });
                      }}
                      confirmVariant="danger"
                      confirmText="Cancel commute"
                      cancelText="Keep"
                      title="You're about to cancel the following commute"
                      message={
                        <>
                          <strong>
                            {dayjs(props.date).format(FULL_TEXT_DATE_WITH_TIME)}
                          </strong>{" "}
                          commute
                          <br />
                          with{" "}
                          <chakra.strong
                            color={
                              passengers.length > 0
                                ? "error.700"
                                : "success.600"
                            }
                          >
                            {passengers.length ?? ""} passenger
                            {passengers.length > 1 ? "s" : ""}
                          </chakra.strong>
                          .
                        </>
                      }
                    >
                      <Button
                        variant="danger"
                        isLoading={cancelCommute.isLoading}
                      >
                        Cancel Commute
                      </Button>
                    </ConfirmModal>
                  </Flex>
                )}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};
