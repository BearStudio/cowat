import { cardAnatomy as parts } from "@chakra-ui/anatomy";

import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  container: {
    shadow: "lg",
    _dark: {
      bg: "gray.800",
    },
  },
});

export const cardTheme = defineMultiStyleConfig({
  baseStyle,
});
