import type { ReactElement, ReactNode } from "react";
import React, { useRef } from "react";

import type { PopoverProps } from "@chakra-ui/react";
import {
  Button,
  ButtonGroup,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";
import FocusLock from "react-focus-lock";

type ConfirmPopoverProps = PopoverProps & {
  isEnabled?: boolean;
  children: ReactElement;
  title?: ReactNode;
  message?: ReactNode;
  onConfirm(): void;
  confirmText?: ReactNode;
  confirmVariant?: string;
  cancelText?: ReactNode;
};

export const ConfirmPopover: React.FC<
  React.PropsWithChildren<ConfirmPopoverProps>
> = ({
  isEnabled = true,
  children,
  title,
  message,
  onConfirm,
  confirmText,
  confirmVariant = "@primary",
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

  return (
    <>
      <Popover
        isLazy
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        initialFocusRef={initialFocusRef}
        {...rest}
      >
        <PopoverTrigger>{children}</PopoverTrigger>
        <Portal>
          <PopoverContent>
            <FocusLock returnFocus persistentFocus={false}>
              <PopoverArrow />
              <PopoverBody fontSize="sm">
                {displayHeading && (
                  <Heading size="sm" mb={message ? 1 : 0}>
                    {displayHeading}
                  </Heading>
                )}
                {message}
              </PopoverBody>
              <PopoverFooter>
                <ButtonGroup size="sm" justifyContent="space-between" w="full">
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
              </PopoverFooter>
            </FocusLock>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  );
};
