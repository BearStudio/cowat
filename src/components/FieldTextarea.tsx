import { useEffect, useState } from "react";

import type { TextareaProps } from "@chakra-ui/react";
import { Textarea } from "@chakra-ui/react";
import type { FieldProps } from "@formiz/core";
import { useField } from "@formiz/core";

import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";

export type FieldTextareaProps = FieldProps &
  FormGroupProps & {
    textareaProps?: Omit<
      TextareaProps,
      | "id"
      | "value"
      | "name"
      | "defaultValue"
      | "onChange"
      | "onBlur"
      | "placeholder"
    >;
    autoFocus?: boolean;
  };

export const FieldTextarea = (props: FieldTextareaProps) => {
  const {
    errorMessage,
    id,
    isValid,
    isSubmitted,
    isPristine,
    resetKey,
    setValue,
    value,
    otherProps,
  } = useField(props);

  const { helper, label, placeholder, textareaProps, autoFocus, ...rest } =
    otherProps as Omit<FieldTextareaProps, keyof FieldProps>;

  const { required } = props;
  const [isTouched, setIsTouched] = useState(false);

  const showError = !isValid && ((isTouched && !isPristine) || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const formGroupProps: FormGroupProps = {
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
      <Textarea
        id={id}
        value={value ?? ""}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsTouched(false)}
        onBlur={() => setIsTouched(true)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        {...textareaProps}
      />
    </FormGroup>
  );
};
