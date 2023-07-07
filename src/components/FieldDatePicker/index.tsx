import type { ChangeEventHandler } from "react";
import { useEffect } from "react";
import { useRef, useState } from "react";

import FocusLock from "react-focus-lock";
import { DayPicker } from "react-day-picker";
import type { InputGroupProps, InputProps } from "@chakra-ui/react";
import { InputLeftElement } from "@chakra-ui/react";
import {
  IconButton,
  Input,
  InputGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";

import dayjs from "dayjs";
import { Icon } from "@/components/Icon";
import { CalendarDays } from "lucide-react";
import { DAY_MONTH_YEAR } from "@/constants/dates";
import type { FieldProps } from "@formiz/core";
import { useField } from "@formiz/core";
import type { FormGroupProps } from "@/components/FormGroup";
import { FormGroup } from "@/components/FormGroup";
import "react-day-picker/dist/style.css";

export function FieldDayPicker(
  props: FieldProps<string> &
    Omit<FormGroupProps, "placeholder"> &
    Pick<InputProps, "placeholder"> & {
      size?: InputGroupProps["size"];
      autoFocus?: boolean;
    }
) {
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
    label,
    placeholder,
    helper,
    size = "md",
    autoFocus,
    ...rest
  } = otherProps;
  const { required } = props;

  const initialFocusRef = useRef<HTMLButtonElement>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isTouched, setIsTouched] = useState(false);
  const showError = !isValid && ((isTouched && !isPristine) || isSubmitted);

  useEffect(() => {
    setIsTouched(false);
  }, [resetKey]);

  const closePopper = () => {
    onClose();
    buttonRef?.current?.focus();
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.currentTarget.value);
  };

  const handleDaySelect = (date: Date | undefined) => {
    setValue(dayjs(date).format(DAY_MONTH_YEAR));

    if (date) {
      closePopper();
    }
  };

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
      <InputGroup size={size}>
        <InputLeftElement>
          <Popover
            isLazy
            isOpen={isOpen}
            onClose={onClose}
            onOpen={onOpen}
            initialFocusRef={initialFocusRef}
          >
            <PopoverTrigger>
              <IconButton
                variant="primary"
                size="sm"
                aria-label="Pick a date"
                icon={<Icon icon={CalendarDays} />}
                isLoading={isValidating}
              />
            </PopoverTrigger>
            <Portal>
              <PopoverContent>
                <FocusLock returnFocus persistentFocus={false}>
                  <PopoverArrow />
                  <PopoverBody fontSize="sm">
                    <DayPicker
                      mode="single"
                      defaultMonth={
                        value && dayjs(value, DAY_MONTH_YEAR).isValid()
                          ? dayjs(value, DAY_MONTH_YEAR).toDate()
                          : undefined
                      }
                      selected={
                        value && dayjs(value, DAY_MONTH_YEAR).isValid()
                          ? dayjs(value, DAY_MONTH_YEAR).toDate()
                          : undefined
                      }
                      onSelect={handleDaySelect}
                      disabled={{ before: dayjs().toDate() }}
                      fromMonth={dayjs().toDate()}
                    />
                  </PopoverBody>
                </FocusLock>
              </PopoverContent>
            </Portal>
          </Popover>
        </InputLeftElement>
        <Input
          pl="12"
          type="text"
          placeholder={placeholder ?? dayjs().format(DAY_MONTH_YEAR)}
          value={value ?? ""}
          onChange={handleInputChange}
          autoFocus={autoFocus}
          onFocus={() => setIsTouched(false)}
          onBlur={() => setIsTouched(true)}
        />
      </InputGroup>
    </FormGroup>
  );
}
