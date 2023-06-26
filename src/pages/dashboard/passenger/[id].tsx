import { Icon } from "@/components/Icon";
import { LateModal } from "@/components/LateModal";
import { Loader } from "@/components/Loader";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { getPassengers, havePassengerOnStop } from "@/utils/commutes";
import { DRIVER_STATUS } from "@/utils/driverStatus";
import { NOT_YET_PASSENGER_IF_INSIDE } from "@/utils/passengers";
import { PASSENGER_STATUS } from "@/utils/passengerStatus";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link as ChakraLink,
  Stack,
  Tag,
  Text,
  useDisclosure,
  StackDivider,
} from "@chakra-ui/react";
import type { Stop } from "@prisma/client";
import { DriverStopStatus } from "@prisma/client";
import dayjs from "dayjs";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiCheckCircle } from "react-icons/fi";

const Passenger = () => {
  const router = useRouter();
  const modal = useDisclosure();
  const { data: session } = useSession();

  const { id } = router.query;
  const commuteId = id?.toString() ?? "";

  const commute = api.commute.commuteById.useQuery(
    {
      id: commuteId,
    },
    { enabled: !!commuteId, refetchInterval: 30_000 }
  );

  const ctx = api.useContext();

  const hereOnStop = api.passenger.hereOnStop.useMutation({
    onSuccess: () => {
      ctx.commute.invalidate();
      ctx.stop.invalidate();
    },
  });

  const iAmLate = api.passenger.iAmLate.useMutation();

  const handleOnLateModalClick = (delay: number | null, id: Stop["id"]) => {
    iAmLate.mutate(
      { delay, id },
      {
        onSuccess: () => {
          modal.onClose();
          ctx.commute.invalidate();
        },
      }
    );
  };

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <Flex justify="space-between">
          <HStack>
            <IconButton
              size="sm"
              aria-label="Go back"
              icon={<Icon icon={ArrowLeft} />}
              as={Link}
              href="/dashboard"
            />
            <Heading size="md">
              Passenger View <Badge>Beta</Badge>
            </Heading>
          </HStack>
          <Button
            variant="link"
            rightIcon={<Icon icon={ExternalLink} />}
            as={ChakraLink}
            href={`https://www.google.com/maps/dir/${commute.data?.stops
              .map((stop) => stop.location?.address)
              .join("/")}`}
          >
            Maps
          </Button>
        </Flex>
      }
    >
      {commute.isLoading && <Loader />}
      {!commute.isLoading && commute.data && (
        <Stack spacing="4">
          <Card>
            <CardHeader p="2">
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold" fontSize="sm">
                  {commute.data.createdBy?.name}&apos;s departure at{" "}
                  {dayjs(commute.data?.date).format("HH:mm A")}
                </Text>
              </Flex>
            </CardHeader>
            <Divider color="gray.200" _dark={{ color: "gray.700" }} />
            <CardBody p="2">
              <Stack spacing="1">
                <Flex justify="space-between">
                  <HStack>
                    <Avatar
                      borderRadius="md"
                      src={commute.data.createdBy?.image ?? ""}
                      size="sm"
                      name={commute.data.createdBy?.name ?? ""}
                    />
                    {commute.data.createdBy?.name && (
                      <Text fontSize="sm">{commute.data.createdBy?.name}</Text>
                    )}
                  </HStack>
                  <HStack>
                    <Tag
                      colorScheme={
                        DRIVER_STATUS[commute.data.status].colorScheme
                      }
                    >
                      {DRIVER_STATUS[commute.data.status].text}{" "}
                      {commute.data.delay} {!!commute.data.delay && " minutes"}
                      <Icon
                        ml="2"
                        icon={DRIVER_STATUS[commute.data.status].icon}
                      />
                    </Tag>
                  </HStack>
                </Flex>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                >
                  <>
                    {commute.data?.stops.length} Stops •{" "}
                    {getPassengers(commute.data.stops).length} Passengers
                  </>
                </Text>
              </Stack>
            </CardBody>
            <Divider color="gray.200" _dark={{ color: "gray.700" }} />
          </Card>
          {commute.data?.stops.map((stop) => (
            <Card key={stop.id}>
              <CardHeader p="2">
                <Stack divider={<StackDivider />}>
                  <Flex justify="space-between">
                    <Stack>
                      <Text fontWeight="bold" fontSize="sm">
                        📍{stop.location?.name}{" "}
                        {!!stop.time && `at ${stop.time}`}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="gray.600"
                        _dark={{ color: "gray.300" }}
                      >
                        {stop.location?.address}
                      </Text>
                    </Stack>
                    {!!stop.passengers.find(
                      (passenger) => passenger.userId === session?.user?.id
                    ) && (
                      <>
                        <Button
                          onClick={() => modal.onOpen()}
                          size="sm"
                          variant="danger"
                          leftIcon={<Icon icon={Clock} />}
                        >
                          I&apos;m late
                        </Button>

                        {modal.isOpen && (
                          <LateModal
                            onClick={(delay) =>
                              handleOnLateModalClick(delay, stop.id)
                            }
                            onClose={modal.onClose}
                          />
                        )}
                      </>
                    )}
                  </Flex>
                  {stop.driverStatus === DriverStopStatus.HERE && (
                    <Text color="green.700" fontSize="xs" fontWeight="medium">
                      {commute.data.createdBy?.name} checked this stop
                      <Icon icon={FiCheckCircle} ml="2" />
                    </Text>
                  )}
                </Stack>
              </CardHeader>
              <Divider color="gray.200" _dark={{ color: "gray.700" }} />
              {havePassengerOnStop(stop) && (
                <CardBody p="2">
                  <Stack>
                    {stop.passengers.map((passenger) => (
                      <Flex
                        key={passenger.userId}
                        justify="space-between"
                        align="center"
                      >
                        <HStack>
                          <Avatar
                            size="sm"
                            src={passenger.user.image ?? ""}
                            name={
                              passenger.user.name ?? passenger.user.email ?? ""
                            }
                            opacity={
                              NOT_YET_PASSENGER_IF_INSIDE.includes(
                                passenger.requestStatus
                              )
                                ? 0.6
                                : 1
                            }
                          />
                          <Text fontSize="sm" fontWeight="medium">
                            {passenger.user.name ?? passenger.user.email}
                          </Text>
                        </HStack>
                        <Tag
                          colorScheme={
                            PASSENGER_STATUS[passenger.stopStatus].colorScheme
                          }
                        >
                          {PASSENGER_STATUS[passenger.stopStatus].text}{" "}
                          {passenger.delay} {!!passenger.delay && " minutes"}
                          <Icon
                            ml="2"
                            icon={PASSENGER_STATUS[passenger.stopStatus].icon}
                          />
                        </Tag>
                      </Flex>
                    ))}
                  </Stack>
                </CardBody>
              )}
              <Divider color="gray.200" _dark={{ color: "gray.700" }} />
              {stop.passengers.some(
                (passenger) =>
                  passenger.userId === session?.user?.id &&
                  passenger.stopStatus !== "ON_TIME"
              ) && (
                <CardFooter p="2">
                  <Button
                    variant="primary"
                    size="sm"
                    w="full"
                    onClick={() => hereOnStop.mutate({ id: stop.id })}
                    isLoading={hereOnStop.isLoading}
                  >
                    I&apos;m here
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </LayoutAuthenticated>
  );
};

export default Passenger;
