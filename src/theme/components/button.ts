import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const primary = defineStyle({
  bg: "gray.900",
  color: "white",
  _hover: {
    _disabled: {
      bg: "gray.900",
    },
  },
});

const danger = defineStyle({
  bg: "white",
  color: "error.700",
  border: "1px solid",
  borderColor: "gray.200",
  _hover: {
    bg: "error.50",
  },
  _focusVisible: {
    ringColor: "error.700",
  },
});

const defaultButton = defineStyle({
  bg: "white",
  color: "gray.600",
  border: "1px solid",
  borderColor: "gray.200",
  _hover: {
    bg: "whiteAlpha.300",
    color: "gray.700",
  },
});

export const buttonTheme = defineStyleConfig({
  baseStyle: {
    _focusVisible: {
      ring: "2px",
      ringColor: "gray.900",
      ringOffset: "2px",
      ringOffsetColor: "white",
    },
  },
  variants: { primary, danger, default: defaultButton },
  defaultProps: {
    variant: "default",
  },
});
