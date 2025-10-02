import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";
import {
  HStack,
  Radio,
  RadioGroup,
  type RadioGroupProps,
} from "@chakra-ui/react";
import type { FieldProps } from "@formiz/core";
import { useField } from "@formiz/core";
import { useEffect, useState } from "react";

export type FieldRadioProps = FieldProps<string> &
  FormGroupProps &
  Omit<RadioGroupProps, "children" | "onChange" | "value"> & {
    options: Array<{ label: string; value: string }>;
  };

export const FieldRadio = (props: FieldRadioProps) => {
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
    helper,
    size = "md",
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
      <RadioGroup
        id={id}
        value={value ?? ""}
        isDisabled={isValidating || isDisabled}
        onChange={(val) => setValue(val)}
      >
        <HStack spacing={6}>
          {options.map(({ label, value }) => (
            <Radio key={value} value={value} size={size}>
              {label}
            </Radio>
          ))}
        </HStack>
      </RadioGroup>
    </FormGroup>
  );
};
