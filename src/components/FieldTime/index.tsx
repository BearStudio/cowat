import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";
import {
  HStack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import type { FieldProps } from "@formiz/core";
import { useField } from "@formiz/core";

export type FieldTimeProps = FieldProps<string> &
  FormGroupProps & { placeholder?: string };

export const FieldTime = (props: FieldTimeProps) => {
  const { errorMessage, id, shouldDisplayError, setValue, value, otherProps } =
    useField(props, {
      formatValue: (value) => {
        const [h, m] = value?.split(":") ?? [];
        if (!h || !m) {
          return null;
        }
        return value;
      },
    });

  const { label, helper, placeholder, ...rest } = otherProps;
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

  const [hours, minutes] = value?.split(":") ?? [];
  const [placeholderHours, placeholderMinutes] = placeholder?.split(":") ?? [];

  return (
    <FormGroup {...formGroupProps}>
      <HStack>
        <NumberInput
          flex={1}
          value={hours ?? ""}
          step={1}
          min={0}
          max={23}
          maxW={32}
          onChange={(h) => setValue(`${h.padStart(2, "0")}:${minutes ?? "00"}`)}
        >
          <NumberInputField placeholder={placeholderHours ?? ""} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Text>:</Text>
        <NumberInput
          flex={1}
          value={minutes ?? ""}
          step={5}
          min={0}
          max={55}
          maxW={32}
          onChange={(m) => setValue(`${hours ?? ""}:${m.padStart(2, "0")}`)}
        >
          <NumberInputField placeholder={placeholderMinutes ?? ""} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </HStack>
    </FormGroup>
  );
};
