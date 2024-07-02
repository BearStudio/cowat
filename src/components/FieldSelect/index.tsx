import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";
import type { SelectProps } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import type { FieldProps } from "@formiz/core";
import { useField } from "@formiz/core";
import { useEffect, useState } from "react";

export type FieldSelectProps = FieldProps<string> &
  FormGroupProps &
  Omit<SelectProps, "children"> & {
    options: Array<{ label: string; value: string }>;
  };

export const FieldSelect = (props: FieldSelectProps) => {
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

  const {
    isDisabled,
    label,
    placeholder,
    helper,
    size = "md",
    autoFocus,
    options,
    ...rest
  } = otherProps;
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
      <Select
        size={size}
        autoFocus={autoFocus}
        placeholder={placeholder ? String(placeholder) : ""}
        value={value ?? ""}
        isDisabled={isValidating || isDisabled}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </FormGroup>
  );
};
