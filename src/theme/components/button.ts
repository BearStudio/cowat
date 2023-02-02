import { defineStyle, defineStyleConfig } from "@chakra-ui/react";

const primary = defineStyle({
  bg: "gray.900",
  color: "white",
});

const danger = defineStyle({
  bg: "white",
  color: "error.700",
  border: "1px solid",
  borderColor: "gray.200",
});

export const buttonTheme = defineStyleConfig({
  variants: { primary, danger },
});
