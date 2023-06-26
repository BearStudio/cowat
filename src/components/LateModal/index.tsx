import type { ModalProps } from "@chakra-ui/react";
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
import type { Commute, PassengersOnStops } from "@prisma/client";

type LateModalProps = Omit<ModalProps, "isOpen" | "children"> & {
  /** Will be called for all the buttons onClick. Take the minutes at parameter or null */
  onClick: (
    minutes: Commute["delay"] | PassengersOnStops["delay"] | null
  ) => void;
};

export const LateModal = ({ onClick, ...props }: LateModalProps) => {
  return (
    <Modal isOpen size="xs" {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader shadow="layout">
          <Text fontWeight="bold" fontSize="lg">
            I&apos;m late
          </Text>
        </ModalHeader>
        <ModalBody p="4">
          <Stack>
            <Button variant="danger" onClick={() => onClick(5)}>
              5 minutes
            </Button>
            <Button variant="danger" onClick={() => onClick(10)}>
              10 minutes
            </Button>
            <Button variant="danger" onClick={() => onClick(15)}>
              15 minutes
            </Button>
            <Button variant="danger" onClick={() => onClick(null)}>
              No idea
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
