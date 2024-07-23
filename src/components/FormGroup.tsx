import type { ReactNode } from "react";
import React from "react";

import type { FormControlProps, StackDirection } from "@chakra-ui/react";
import { Stack } from "@chakra-ui/react";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  SlideFade,
} from "@chakra-ui/react";
import { FiAlertCircle } from "react-icons/fi";

import { Icon } from "@/components/Icon";

export type FormGroupProps = Omit<
  FormControlProps,
  "onChange" | "defaultValue" | "label"
> & {
  children?: ReactNode;
  errorMessage?: ReactNode;
  helper?: ReactNode;
  id?: string;
  isRequired?: boolean;
  label?: ReactNode;
  showError?: boolean;
  displayDirection?: StackDirection;
};

export const FormGroup = ({
  children,
  errorMessage,
  helper,
  id,
  isRequired,
  label,
  showError,
  displayDirection,
  ...props
}: FormGroupProps) => {
  const isDisplayRow =
    displayDirection === "row" || displayDirection === "row-reverse";
  return (
    <FormControl isInvalid={showError} isRequired={isRequired} {...props}>
      <Stack spacing={0} direction={displayDirection}>
        {!!label && (
          <FormLabel htmlFor={id} mb={isDisplayRow ? 0 : undefined}>
            {label}
          </FormLabel>
        )}
        {children}
      </Stack>
      {!!helper && <FormHelperText>{helper}</FormHelperText>}

      {!!errorMessage && (
        <FormErrorMessage id={`${id}-error`}>
          <SlideFade in offsetY={-6}>
            <Icon icon={FiAlertCircle} me="2" />
            {errorMessage}
          </SlideFade>
        </FormErrorMessage>
      )}
    </FormControl>
  );
};
