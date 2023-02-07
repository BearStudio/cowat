import type { ReactElement, ReactNode } from "react";
import React, { useRef } from "react";

import type { ModalProps } from "@chakra-ui/react";
import {
  Button,
  ButtonGroup,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";

type ConfirmModalProps = Omit<ModalProps, "isOpen" | "onClose"> & {
  isEnabled?: boolean;
  children: ReactElement;
  title?: ReactNode;
  message?: ReactNode;
  onConfirm(): void;
  confirmText?: ReactNode;
  confirmVariant?: string;
  cancelText?: ReactNode;
};

export const ConfirmModal: React.FC<
  React.PropsWithChildren<ConfirmModalProps>
> = ({
  isEnabled = true,
  children,
  title,
  message,
  onConfirm,
  confirmText,
  confirmVariant = "primary",
  cancelText,
  ...rest
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const displayHeading = !title && !message ? "Confirm" : title;

  const initialFocusRef = useRef<HTMLButtonElement>(null);

  if (!isEnabled) {
    const childrenWithOnClick = React.cloneElement(children, {
      onClick: onConfirm,
    });
    return <>{childrenWithOnClick}</>;
  }

  const childrenWithOnOpen = React.cloneElement(children, {
    onClick: onOpen,
  });

  return (
    <>
      {childrenWithOnOpen}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xs"
        initialFocusRef={initialFocusRef}
        {...rest}
      >
        <Portal>
          <ModalOverlay />
          <ModalContent>
            <ModalBody fontSize="sm" pt={4}>
              {displayHeading && (
                <Heading size="sm" mb={message ? 1 : 0}>
                  {displayHeading}
                </Heading>
              )}
              {message}
            </ModalBody>
            <ModalFooter>
              <ButtonGroup justifyContent="space-between" w="full">
                <Button onClick={onClose}>{cancelText ?? "Cancel"}</Button>
                <Button
                  variant={confirmVariant}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  ref={initialFocusRef}
                >
                  {confirmText ?? "Confirm"}
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Portal>
      </Modal>
    </>
  );
};
