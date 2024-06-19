import { ONLY_TIME } from "@/constants/dates";
import { api } from "@/utils/api";
import type { ModalProps } from "@chakra-ui/react";
import { ButtonGroup, HStack, ModalFooter } from "@chakra-ui/react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { CommuteStatus, DriverStopStatus, Location, PassengersOnStops, User } from "@prisma/client";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

type Stop = {
    id: string;
    locationId: string | null;
    location: Location | null;
    time: string | null;
    commuteId: string | null;
    commuteTemplateId: string | null;
    passengers: PassengersOnStops[]
    driverStatus: DriverStopStatus;
}

type Commute = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean | null;
  createdBy: User | null;
  createdById: string;
  date: Date;
  seats: number;
  status: CommuteStatus
  delay: number | null;
  stops: Stop[];
  comment: string | null;
}

type ConfirmBookingModalProps = Omit<ModalProps, "isOpen" | "children"> & {
  myCommutes: Commute[];
  onConfirm: () => void;
};

export const ConfirmBookingModal = ({
  onConfirm,
  onClose,
  myCommutes,
  ...props
}: ConfirmBookingModalProps) => {
  const { data: session } = useSession();
  const ctx = api.useContext();
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
  return (
    <Modal isOpen size="lg" onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader shadow="layout">
          <Text fontWeight="bold" fontSize="lg">
            Confirm booking
          </Text>
        </ModalHeader>
        <ModalBody p="4">
          <Stack>
            {myCommutes.length <= 0 ? (
              <Text fontWeight="bold" fontSize="sm" color="green.700">
                You do not have any other commutes that day!
              </Text>
            ) : (
              <>
                <Text fontWeight="bold" fontSize="sm">
                  You are already in other commutes (as Driver or Passenger)
                </Text>
                {myCommutes
                  ?.filter((commute) => !commute.isDeleted)
                  .map((commute) => (
                    <HStack key={commute.id} justifyContent="space-between">
                      {commute.createdById === session?.user?.id ? (
                        <>
                          <Text>Driver for a commute at {dayjs(commute.date).format(ONLY_TIME)}</Text>
                          <Button
                            variant="danger"
                            onClick={() => {
                              cancelCommute.mutate({ id: commute.id });
                            }}
                          >
                            Cancel commute
                          </Button>
                        </>
                      ) : (
                        <>
                          <Text>Passenger for {commute.createdBy?.name}&apos;s commute at {dayjs(commute.date).format(ONLY_TIME)}</Text>
                          <Button
                            variant="danger"
                            onClick={() =>
                              updateRequestStatus.mutate({
                                stopId: commute.stops.find((stop) =>
                                  stop.passengers.some(
                                    (passenger: PassengersOnStops) =>
                                      passenger.userId === session?.user?.id &&
                                      passenger.requestStatus !== "CANCELED" &&
                                      passenger.requestStatus !== "REFUSED"
                                  )
                                )?.id || "",
                                passengerId: session?.user?.id as string,
                                requestStatus: "CANCELED",
                              })
                            }
                          >
                            Cancel booking
                          </Button>
                        </>
                      
                      )}
                    </HStack>
                  ))
                }
              </>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup justifyContent="space-between" w="full">
            <Button
              variant={"primary"}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Book
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
