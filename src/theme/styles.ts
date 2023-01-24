import type { Theme } from "@chakra-ui/react";

export const styles: Theme["styles"] = {
  global: {
    body: {
      color: "gray.900",
      bg: "gray.50",
      WebkitTapHighlightColor: "transparent",
    },
    "#chakra-toast-portal > *": {
      pt: "safe-top",
      pl: "safe-left",
      pr: "safe-right",
      pb: "safe-bottom",
    },
  },
};
