import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const defaultSwitch = defineStyle({
  ".chakra-switch__track": {
    bg: "gray.200",
    borderColor: "gray.200",
    _checked: {
      bg: "blue.500",
    },
    _dark: {
      bg: "gray.600",
      borderColor: "gray.900",
      _checked: {
        bg: "blue.300",
      },
    },
  },
  ".chakra-switch__thumb": {
    bg: "white",
    _dark: {
      bg: "gray.800",
    },
  },
});

export const switchTheme = defineStyleConfig({
  baseStyle: {
    _focusVisible: {
      ring: "2px",
      ringColor: "gray.900",
      ringOffset: "2px",
      ringOffsetColor: "white",
      _dark: {
        ringColor: "white",
        ringOffsetColor: "gray.800",
      },
    },
  },
  variants: { default: defaultSwitch },
  defaultProps: {
    variant: "default",
  },
});
