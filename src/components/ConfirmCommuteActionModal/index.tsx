import { ONLY_TIME } from "@/constants/dates";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import type { ModalProps } from "@chakra-ui/react";
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { PassengersOnStops } from "@prisma/client";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { ConfirmCancelCommuteModal } from "@/components/ConfirmCancelCommuteModal";

type CommuteType = RouterOutputs["commute"]["commuteById"];

type ConfirmCommuteActionModalProps = Omit<
  ModalProps,
  "isOpen" | "children"
> & {
  myCommutes: CommuteType[];
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  confirmText?: string;
};

export const ConfirmCommuteActionModal = ({
  onConfirm,
  onClose,
  myCommutes,
  title = "Confirm",
  confirmText = "Save",
  ...props
}: ConfirmCommuteActionModalProps) => {
  const { data: session } = useSession();
  const ctx = api.useContext();

  const updateRequestStatus = api.stop.requestStatus.useMutation({
    onSuccess: async () => {
      await ctx.commute.invalidate();
      await ctx.stop.invalidate();
    },
  });

  const handleCancelClick = (commute: CommuteType) => {
    const stopToCancelId = commute.stops.find((stop) =>
      stop.passengers.some(
        (passenger: PassengersOnStops) =>
          passenger.userId === session?.user?.id &&
          passenger.requestStatus !== "CANCELED" &&
          passenger.requestStatus !== "REFUSED"
      )
    )?.id;

    updateRequestStatus.mutate({
      stopId: stopToCancelId || "",
      passengerId: session?.user?.id || "",
      requestStatus: "CANCELED",
    });
  };

  const firstStopTime = (commute: CommuteType) => {
    return commute.stops.map((stop) => stop.time).sort()[0];
  };

  const stopTimeWhenPassenger = (commute: CommuteType) => {
    for (let stop of commute.stops) {
      if (
        stop.passengers.some(
          (passenger) => passenger.userId === session?.user?.id
        )
      ) {
        return stop.time;
      }
    }
  };

  return (
    <Modal isOpen size="lg" onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader shadow="layout">
          <Text fontWeight="bold" fontSize="lg">
            {title}
          </Text>
        </ModalHeader>
        <ModalBody p="4">
          <Stack>
            {myCommutes.length === 0 ? (
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
                          <Text>
                            Driver for a commute at {firstStopTime(commute)}
                          </Text>
                          <ConfirmCancelCommuteModal commute={commute} />
                        </>
                      ) : (
                        <>
                          <Text>
                            Passenger for {commute.createdBy?.name}&apos;s
                            commute at {stopTimeWhenPassenger(commute)}
                          </Text>
                          <Button
                            variant="danger"
                            onClick={() => handleCancelClick(commute)}
                            isLoading={updateRequestStatus.isLoading}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </HStack>
                  ))}
              </>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter justifyContent="space-between" w="full">
          <Button
            variant={"primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
