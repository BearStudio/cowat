import { alertAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(alertAnatomy.keys);

const infoGray = definePartsStyle({
  container: {
    background: "gray.200",

    _dark: {
      background: "gray.700",
    },
  },
  title: {
    color: "gray.800",
    _dark: {
      color: "gray.200",
    },
  },
  description: {
    color: "gray.800",
    _dark: {
      color: "gray.200",
    },
  },
  icon: {
    color: "gray.500",
    _dark: {
      color: "gray.300",
    },
  },
});

export const alertTheme = defineMultiStyleConfig({
  variants: { infoGray },
});
