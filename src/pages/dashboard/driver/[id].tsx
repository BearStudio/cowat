import { Icon } from "@/components/Icon";
import { LateModal } from "@/components/LateModal";
import { Loader } from "@/components/Loader";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { getPassengers, havePassengerOnStop } from "@/utils/commutes";
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
} from "@chakra-ui/react";

import dayjs from "dayjs";
import { ArrowLeft, CheckCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { isNumber } from "remeda";

const Driver = () => {
  const router = useRouter();
  const modal = useDisclosure();

  const { id } = router.query;
  const commuteId = id?.toString() ?? "";

  const commute = api.commute.commuteById.useQuery(
    {
      id: commuteId,
    },
    { enabled: !!commuteId, refetchInterval: 30_000 }
  );

  const ctx = api.useContext();

  const onMyWay = api.driver.onTime.useMutation({
    onSuccess: () => {
      ctx.commute.invalidate();
    },
  });

  const hereOnStop = api.driver.hereOnStop.useMutation({
    onSuccess: () => {
      ctx.commute.invalidate();
      ctx.stop.invalidate();
    },
  });

  const iAmLate = api.driver.iAmLate.useMutation();

  const handleOnLateModalClick = (minutes: number | null) => {
    iAmLate.mutate(
      { delay: minutes, id: commuteId },
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
              Driver View <Badge>Beta</Badge>
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
      {modal.isOpen && (
        <LateModal onClose={modal.onClose} onClick={handleOnLateModalClick} />
      )}
      {commute.isLoading && <Loader />}
      {!commute.isLoading && commute.data && (
        <Stack spacing="4">
          <Card>
            <CardHeader p="2">
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold" fontSize="sm">
                  Departure at {dayjs(commute.data?.date).format("HH:mm A")}
                </Text>

                <Button
                  onClick={() => modal.onOpen()}
                  size="sm"
                  variant="danger"
                  leftIcon={<Icon icon={Clock} />}
                >
                  I&apos;m late
                </Button>
              </Flex>
            </CardHeader>
            <Divider color="gray.200" _dark={{ color: "gray.700" }} />
            <CardBody p="2">
              <Stack spacing="1">
                <Text
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: "gray.300" }}
                >
                  <>
                    {commute.data?.stops.length} Stops •{" "}
                    {getPassengers(commute.data.stops).length} Passengers{" "}
                    {commute.data.status === "DELAYED" && (
                      <Text
                        as="span"
                        fontSize="sm"
                        color="error.700"
                        _dark={{ color: "error.500" }}
                      >
                        •{" "}
                        {isNumber(commute.data.delay) ? (
                          <>{commute.data.delay} minutes late</>
                        ) : (
                          "You are late"
                        )}
                      </Text>
                    )}
                  </>
                </Text>
              </Stack>
            </CardBody>
            <Divider color="gray.200" _dark={{ color: "gray.700" }} />
            {commute.data.status === "UNKNOWN" && (
              <CardFooter p="2">
                <Button
                  variant="primary"
                  w="full"
                  leftIcon={<Icon icon={CheckCircle} />}
                  isLoading={onMyWay.isLoading}
                  onClick={() => onMyWay.mutate({ id: commuteId })}
                >
                  On my way
                </Button>
              </CardFooter>
            )}
          </Card>
          {commute.data?.stops.map((stop) => (
            <Card key={stop.id}>
              <CardHeader p="2">
                <Stack>
                  <Text fontWeight="bold" fontSize="sm">
                    📍{stop.location?.name} {!!stop.time && `at ${stop.time}`}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="gray.600"
                    _dark={{ color: "gray.300" }}
                  >
                    {stop.location?.address}
                  </Text>
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
                          {PASSENGER_STATUS[passenger.stopStatus].text}
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

              <CardFooter p="2">
                <Button
                  variant="primary"
                  size="sm"
                  w="full"
                  isDisabled={
                    commute.data.status === "UNKNOWN" ||
                    stop.driverStatus === "HERE"
                  }
                  onClick={() => hereOnStop.mutate({ id: stop.id })}
                  isLoading={hereOnStop.isLoading}
                >
                  {stop.driverStatus === "UNKNOWN"
                    ? "I'm here"
                    : "You are here"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Stack>
      )}
    </LayoutAuthenticated>
  );
};

export default Driver;
