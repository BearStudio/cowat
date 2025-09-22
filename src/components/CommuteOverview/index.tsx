import { Icon } from "@/components/Icon";
import { FULL_TEXT_DATE, ONLY_TIME } from "@/constants/dates";
import { api } from "@/utils/api";
import { getPassengers } from "@/utils/commutes";
import { NOT_YET_PASSENGER_IF_INSIDE } from "@/utils/passengers";
import {
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
  useDisclosure,
  ButtonGroup,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import type { Prisma, RequestStatus, TripType } from "@prisma/client";
import dayjs from "dayjs";
import {
  CheckCircle2,
  ChevronDownIcon,
  Clock,
  Navigation,
  Pencil,
  Phone,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ConfirmCommuteActionModal } from "@/components/ConfirmCommuteActionModal";
import { ConfirmCancelCommuteModal } from "@/components/ConfirmCancelCommuteModal";
import { commuteTypeLabels } from "@/constants/commuteType";

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

  const confirmCommuteActionModal = useDisclosure();

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

  const isCurrentUserCreator =
    !!session?.user?.id && props.createdBy?.id === session?.user?.id;

  const getIsPassengerOnStopByStatus = (
    stop: CommuteOverviewProps["stops"][number],
    status: RequestStatus
  ) => {
    return stop.passengers.some(
      (passenger) =>
        passenger.userId === session?.user?.id &&
        passenger.requestStatus === status
    );
  };

  const isPassengerAcceptedOnCommute = props.stops.some((stop) =>
    getIsPassengerOnStopByStatus(stop, "ACCEPTED")
  );
  const isPassengerRequestedOnCommute =
    !isPassengerAcceptedOnCommute &&
    props.stops.some((stop) => getIsPassengerOnStopByStatus(stop, "REQUESTED"));

  const isPassenger =
    !!session?.user?.id &&
    (isPassengerAcceptedOnCommute || isPassengerRequestedOnCommute);

  const myCommutesOnDate = api.commute.allMyCommutesOnDate.useQuery({
    date: dayjs(props.date).format("YYYY-MM-DD"),
  });

  const outboundPassengers = getPassengers(props.stops, "OUTBOUND");
  const returnPassengers = getPassengers(props.stops, "RETURN");
  const roundPassengers = getPassengers(props.stops, "ROUND");

  const isFull =
    (props.commuteType === "ROUND" &&
      (roundPassengers.length === (props.seatsOutbound ?? 0) ||
        roundPassengers.length === (props.seatsReturn ?? 0))) ||
    (props.commuteType === "OUTBOUND" &&
      outboundPassengers.length === (props.seatsOutbound ?? 0)) ||
    (props.commuteType === "RETURN" &&
      returnPassengers.length === (props.seatsReturn ?? 0));

  const commuteCanBeBooked =
    !isCurrentUserCreator &&
    !isPassenger &&
    !isFull &&
    dayjs().isBefore(dayjs(props.date));

  const handleBookClick = (stopId: string, tripType: TripType) => {
    if (myCommutesOnDate.isSuccess && myCommutesOnDate.data?.length > 0) {
      confirmCommuteActionModal.onOpen();
    } else {
      bookCommute.mutate({ stopId, tripType });
    }
  };

  const commuteColor = (() => {
    if (props.isDeleted) {
      return { light: "error.500", dark: "error.600" } as const;
    }

    if (isCurrentUserCreator) {
      return { light: "brand.500", dark: "brand.600" } as const;
    }

    if (isPassengerAcceptedOnCommute) {
      return { light: "success.500", dark: "success.600" } as const;
    }

    if (isPassengerRequestedOnCommute) {
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
                <Text fontWeight="bold" fontSize="sm">
                  {` ${dayjs(props.date).format(FULL_TEXT_DATE)} ${dayjs(
                    props.date
                  ).format("HH:mm")}`}
                </Text>
              </HStack>
              <Text fontSize="sm">
                {props.createdBy?.name ?? props.createdBy?.email}
              </Text>
            </Stack>
          </HStack>
          {!props.isDeleted && (
            <AvatarGroup size="sm" max={3}>
              {roundPassengers.map((passenger) => (
                <Avatar
                  key={passenger.user.id}
                  src={passenger.user.image ?? ""}
                  name={passenger.user.name ?? passenger.user.email ?? ""}
                  opacity={
                    NOT_YET_PASSENGER_IF_INSIDE.includes(
                      passenger.requestStatus
                    )
                      ? 0.6
                      : 1
                  }
                  border="2px solid white"
                />
              ))}
            </AvatarGroup>
          )}
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
                <Flex flex="1" align="center">
                  <Text fontWeight="medium" fontSize="sm">
                    {`Type : ${commuteTypeLabels[props.commuteType]}`}
                  </Text>
                </Flex>
                <Flex flex="1" align="center">
                  <Text fontWeight="medium" fontSize="sm">
                    {`${
                      props.departureTime
                        ? `Home departure : ${dayjs(props.departureTime).format(
                            ONLY_TIME
                          )}`
                        : ""
                    } 
                      ${
                        props.departureTime && props.returnTime ? "and" : ""
                      }    
                      ${
                        props.returnTime
                          ? `Work departure : ${dayjs(props.returnTime).format(
                              ONLY_TIME
                            )}`
                          : ""
                      }
                    `}
                  </Text>
                </Flex>
                <Flex flex="1" align="center" justify="space-between">
                  <Flex align="center">
                    <AccordionIcon />
                    <Text fontWeight="medium" fontSize="sm">
                      {props.stops.length} stop
                      {props.stops.length > 1 ? "s" : ""} ·{/* OUTBOUND*/}
                      {props.commuteType === "OUTBOUND" &&
                        `${outboundPassengers.length}/${
                          props.seatsOutbound
                        } seat${(props.seatsOutbound ?? 0) > 1 ? "s" : ""}`}
                      {/* RETURN */}
                      {props.commuteType === "RETURN" &&
                        `${returnPassengers.length}/${props.seatsReturn} seat${
                          (props.seatsReturn ?? 0) > 1 ? "s" : ""
                        }`}
                      {/* ROUND */}
                      {props.commuteType === "ROUND" &&
                        `${roundPassengers.length}/${props.seatsOutbound} seats alley and ${roundPassengers.length}/${props.seatsReturn} seats return`}
                    </Text>
                  </Flex>
                  {isPassengerAcceptedOnCommute && !props.isDeleted && (
                    <Badge colorScheme="success" variant="solid">
                      Passenger <Icon icon={CheckCircle2} />
                    </Badge>
                  )}
                  {isPassengerRequestedOnCommute && !props.isDeleted && (
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
                    (passenger) =>
                      !["CANCELED", "REFUSED"].includes(passenger.requestStatus)
                  );

                  return (
                    <HStack key={stop.id}>
                      <Stack key={stop.id} spacing={2} w="full">
                        <Stack spacing={0} flex={1}>
                          <Text fontWeight="bold" fontSize="sm">
                            📍 {!!stop.time && stop.time} ·{" "}
                            {stop.location?.name}
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
                          {!!passengers.length && !props.isDeleted && (
                            <Wrap pt="1">
                              {passengers.map((passenger) => (
                                <Tag
                                  size="sm"
                                  key={passenger.userId}
                                  colorScheme={
                                    passenger.requestStatus === "ACCEPTED"
                                      ? "success"
                                      : undefined
                                  }
                                >
                                  {passenger.user.name ?? passenger.user.email}
                                </Tag>
                              ))}
                            </Wrap>
                          )}
                        </Stack>
                        {commuteCanBeBooked && (
                          <>
                            {props.commuteType === "OUTBOUND" && (
                              <Button
                                type="submit"
                                variant="primary"
                                onClick={() =>
                                  handleBookClick(stop.id, "OUTBOUND")
                                }
                                isLoading={bookCommute.isLoading}
                              >
                                Book
                              </Button>
                            )}
                            {props.commuteType === "RETURN" && (
                              <Button
                                type="submit"
                                variant="primary"
                                onClick={() =>
                                  handleBookClick(stop.id, "RETURN")
                                }
                                isLoading={bookCommute.isLoading}
                              >
                                Book
                              </Button>
                            )}
                            {props.commuteType === "ROUND" && (
                              <ButtonGroup>
                                <Button
                                  type="submit"
                                  variant="primary"
                                  onClick={() =>
                                    handleBookClick(stop.id, "ROUND")
                                  }
                                  isLoading={bookCommute.isLoading}
                                >
                                  Book
                                </Button>
                                <Menu>
                                  <MenuButton
                                    as={Button}
                                    rightIcon={<ChevronDownIcon />}
                                  >
                                    Options
                                  </MenuButton>
                                  <MenuList>
                                    <MenuItem
                                      onClick={() =>
                                        handleBookClick(stop.id, "OUTBOUND")
                                      }
                                    >
                                      One-way
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() =>
                                        handleBookClick(stop.id, "RETURN")
                                      }
                                    >
                                      Return
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </ButtonGroup>
                            )}
                          </>
                        )}
                      </Stack>
                      {confirmCommuteActionModal.isOpen && (
                        <ConfirmCommuteActionModal
                          title="Confirm booking"
                          confirmText="Book"
                          onClose={confirmCommuteActionModal.onClose}
                          onConfirm={() =>
                            bookCommute.mutate({
                              stopId: stop.id,
                              tripType: props.commuteType,
                            })
                          }
                          myCommutes={myCommutesOnDate.data || []}
                        />
                      )}
                      {isPassenger &&
                        (getIsPassengerOnStopByStatus(stop, "REQUESTED") ||
                          getIsPassengerOnStopByStatus(stop, "ACCEPTED")) && (
                          <HStack>
                            <Button
                              colorScheme="red"
                              onClick={() =>
                                updateRequestStatus.mutate({
                                  stopId: stop.id,
                                  passengerId: session?.user?.id as string,
                                  requestStatus: "CANCELED",
                                  tripType: props.commuteType,
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
                    <ConfirmCancelCommuteModal commute={props} />
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
