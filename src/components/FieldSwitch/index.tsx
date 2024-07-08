import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";
import type { FieldProps } from "@formiz/core";

import React, { useEffect, useState } from "react";
import { useField } from "@formiz/core";
import { SwitchProps } from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react";

export type FieldSwitchProps = FieldProps<boolean> &
  FormGroupProps &
  Omit<SwitchProps, "children"> & {
    autoFocus?: boolean;
  };

export const FieldSwitch = (props: FieldSwitchProps) => {
  const {
    errorMessage,
    id,
    isValid,
    isPristine,
    isSubmitted,
    isValidating,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField(props);

  const { label, helper, size = "md", autoFocus, ...rest } = otherProps;

  const { required } = props;
  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && ((isTouched && !isPristine) || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const formGroupProps = {
    errorMessage,
    helper,
    id,
    isRequired: !!required,
    label,
    showError,
    ...rest,
  };

  return (
    <FormGroup {...formGroupProps}>
      <Switch
        isChecked={Boolean(value)}
        isDisabled={isValidating}
        size={size}
        autoFocus={autoFocus}
        // sx={{
        //   ".chakra-switch__track": {
        //     bg: "gray.200",
        //     borderColor: "gray.200",
        //     _checked: {
        //       bg: "blue.500",
        //     },
        //     _dark: {
        //       bg: "gray.600",
        //       borderColor: "gray.900",
        //       _checked: {
        //         bg: "blue.300",
        //       },
        //     },
        //   },
        //   ".chakra-switch__thumb": {
        //     bg: "white",
        //     _dark: {
        //       bg: "gray.800",
        //     },
        //   },
        // }}
        // Type error here, require help with formiz
        onChange={(e) => setValue(e.target.checked)}
        {...rest}
      />
    </FormGroup>
  );
};
