import { Icon } from "@/components/Icon";
import { FULL_TEXT_DATE_WITH_TIME } from "@/constants/dates";
import { api } from "@/utils/api";
import { getPassengers } from "@/utils/commutes";
import { NOT_YET_PASSENGER_IF_INSIDE } from "@/utils/passengers";
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
  IconButton,
  Stack,
  StackDivider,
  Tag,
  Text,
  Wrap,
  Spacer,
  useBreakpointValue,
  Tooltip,
} from "@chakra-ui/react";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { CheckCircle2, Clock, Navigation, Pencil, Phone } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ConfirmModal } from "@/components/ConfirmModal";

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

  const isMobile = useBreakpointValue({ base: true, md: false });

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
  const isCurrentUserCreator =
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
  const isFull = passengers.length === props.seats;

  const commuteColor = (() => {
    if (props.isDeleted) {
      return { light: "error.500", dark: "error.600" } as const;
    }

    if (isCurrentUserCreator) {
      return { light: "brand.500", dark: "brand.600" } as const;
    }

    if (passengerStatus === "ACCEPTED") {
      return { light: "success.500", dark: "success.600" } as const;
    }

    if (passengerStatus === "REQUESTED") {
      return { light: "warning.500", dark: "warning.600" } as const;
    }

    return { light: "gray.300", dark: "gray.500" } as const;
  })();

  return (
    <Card
      position="relative"
      borderStart="6px solid"
      borderColor={commuteColor.light}
      boxShadow="card"
      overflow="hidden"
      _dark={{ borderColor: commuteColor.dark }}
    >
      <CardHeader pb={0} zIndex={1} position="relative">
        {(isPassenger || isCurrentUserCreator) && (
          <Box
            position="absolute"
            top={12}
            right={-8}
            borderRadius="full"
            w={32}
            h={32}
            bg={commuteColor.light}
            opacity={0.6}
            filter="blur(80px)"
            blendMode="multiply"
            _dark={{
              bg: commuteColor.dark,
            }}
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
                {props.createdBy?.name ?? props.createdBy?.email}
              </Text>
            </Stack>
          </HStack>
          <AvatarGroup size="sm" max={3}>
            {passengers.map((passenger) => (
              <Avatar
                key={passenger.user.id}
                src={passenger.user.image ?? ""}
                name={passenger.user.name ?? passenger.user.email ?? ""}
                opacity={
                  NOT_YET_PASSENGER_IF_INSIDE.includes(passenger.requestStatus)
                    ? 0.6
                    : 1
                }
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
                      {props.stops.length > 1 ? "s" : ""} ·{" "}
                      {
                        passengers.filter(
                          (passenger) => passenger.requestStatus !== "REFUSED"
                        ).length
                      }
                      /{props.seats} seat
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
                  {isCurrentUserCreator && !props.isDeleted && (
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
                    <Text
                      fontSize="sm"
                      textAlign="left"
                      color="gray.600"
                      _dark={{ color: "gray.300" }}
                    >
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
                        <Tooltip label={stop?.location?.address}>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            _dark={{ color: "gray.300" }}
                            wordBreak="break-word"
                            noOfLines={3}
                          >
                            {stop?.location?.address}
                          </Text>
                        </Tooltip>
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
                      {!isCurrentUserCreator &&
                        (!isPassenger ||
                          passengerStatus === "CANCELED" ||
                          passengerStatus === "REFUSED") &&
                        !isFull &&
                        dayjs().isBefore(dayjs(props.date)) && (
                          <Button
                            variant="primary"
                            onClick={() =>
                              bookCommute.mutate({ stopId: stop.id })
                            }
                            isLoading={bookCommute.isLoading}
                          >
                            Book
                          </Button>
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
                <Flex gap="4">
                  {isCurrentUserCreator && !props.isDeleted && (
                    <>
                      <IconButton
                        aria-label="Edit commute"
                        icon={<Icon icon={Pencil} />}
                        as={Link}
                        href={`/commutes/${props.id}`}
                      />
                      {isMobile && (
                        <IconButton
                          aria-label="Open commute's view"
                          icon={<Icon icon={Navigation} />}
                          as={Link}
                          href={`/dashboard/driver/${props.id}`}
                        />
                      )}
                      {!isMobile && (
                        <Button
                          variant="outline"
                          leftIcon={<Icon icon={Navigation} />}
                          as={Link}
                          href={`/dashboard/driver/${props.id}`}
                        >
                          Open commute&apos;s view
                        </Button>
                      )}
                    </>
                  )}
                  {isCurrentUserCreator && !props.isDeleted && (
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
                  )}
                  <Spacer />
                  {props.createdBy?.phone && (
                    <IconButton
                      variant="primary"
                      aria-label={`Call ${
                        props.createdBy.name || props.createdBy.email
                      }`}
                      as="a"
                      href={`tel:${props.createdBy?.phone}`}
                      icon={<Icon icon={Phone} />}
                    />
                  )}
                </Flex>
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};
