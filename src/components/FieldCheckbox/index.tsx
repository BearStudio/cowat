import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";
import type { FieldProps } from "@formiz/core";

import React, { useEffect, useState } from "react";
import { useField } from "@formiz/core";
import { Checkbox, CheckboxProps } from "@chakra-ui/react";

export type FieldCheckboxProps = FieldProps<boolean> &
  FormGroupProps &
  Omit<CheckboxProps, "children" | "value" | "defaultValue"> & {
    autoFocus?: boolean;
  };

export const FieldCheckbox = (props: FieldCheckboxProps) => {
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

  const { label, helper, size = "md", ...rest } = otherProps;

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
    showError,
    label,
    ...rest,
  };

  return (
    <FormGroup displayDirection="row" {...formGroupProps}>
      <Checkbox
        isChecked={Boolean(value)}
        isDisabled={isValidating}
        size={size}
        onChange={(e) => setValue(e.target.checked)}
        {...rest}
      />
    </FormGroup>
  );
};
