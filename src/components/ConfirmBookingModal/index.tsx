import { api } from "@/utils/api";
import { ButtonGroup, HStack, ModalFooter, ModalProps } from "@chakra-ui/react";
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
import type { Commute, PassengersOnStops, Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";

type ConfirmBookingModalProps = Omit<ModalProps, "isOpen" | "children"> & {
  commuteId: number;
  myCommutes: any;
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
            <Text fontWeight="bold" fontSize="sm">
              You are already in other commutes (as Driver or Passenger)
            </Text>
            {myCommutes
              ?.filter((commute) => !commute.isDeleted)
              .map((commute) => (
                <HStack key={commute.id} justifyContent="space-between">
                  <Text>{commute.id}</Text>
                  {commute.createdById === session?.user?.id ? (
                    <Button
                      variant="danger"
                      onClick={() => {
                        cancelCommute.mutate({ id: commute.id });
                      }}
                    >
                      Cancel commute
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={() =>
                        updateRequestStatus.mutate({
                          stopId: commute.stops.find((stop) =>
                            stop.passengers.some(
                              (passenger) =>
                                passenger.userId === session?.user?.id &&
                                passenger.requestStatus !== "CANCELED" &&
                                passenger.requestStatus !== "REFUSED"
                            )
                          ).id,
                          passengerId: session.user?.id as string,
                          requestStatus: "CANCELED",
                        })
                      }
                    >
                      Cancel booking
                    </Button>
                  )}
                </HStack>
              ))}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup justifyContent="space-between" w="full">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant={"primary"}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Book
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
