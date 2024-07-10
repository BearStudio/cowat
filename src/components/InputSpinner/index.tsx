import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";
import {
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import type { FieldProps } from "@formiz/core";
import { useField } from "@formiz/core";

export type FieldNumberProps = FieldProps<number> &
  FormGroupProps & { placeholder?: number };

export const FieldNumber = (props: FieldNumberProps) => {
  const { errorMessage, id, shouldDisplayError, setValue, value, otherProps } =
    useField(props);

  const { label, helper, ...rest } = otherProps;
  const { required } = props;
  const showError = shouldDisplayError;

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
      <HStack>
        <NumberInput
          flex={1}
          value={value ?? ""}
          step={1}
          min={1}
          max={10}
          onChange={(_, numValue) => setValue(numValue)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </HStack>
    </FormGroup>
  );
};
