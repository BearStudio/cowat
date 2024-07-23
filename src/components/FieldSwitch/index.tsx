import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";
import type { FieldProps } from "@formiz/core";

import React, { useEffect, useState } from "react";
import { useField } from "@formiz/core";
import type { SwitchProps } from "@chakra-ui/react";
import { Switch } from "@chakra-ui/react";

export type FieldSwitchProps = FieldProps<boolean> &
  FormGroupProps &
  Omit<SwitchProps, "children" | "value" | "defaultValue"> & {
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
    <FormGroup displayDirection="row" {...formGroupProps}>
      <Switch
        isChecked={Boolean(value)}
        isDisabled={isValidating}
        size={size}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.checked)}
        alignSelf="center"
        {...rest}
      />
    </FormGroup>
  );
};
