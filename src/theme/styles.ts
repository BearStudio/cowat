import type { Theme } from "@chakra-ui/react";

export const styles: Theme["styles"] = {
  global: {
    html: {
      height: "100%",
    },
    body: {
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      color: "gray.900",
      bg: "gray.50",
      WebkitTapHighlightColor: "transparent",
      _dark: {
        bg: "gray.900",
        color: "white",
      },
    },
    "#__next": {
      display: "flex",
      flexDirection: "column",
      flex: 1,
    },
    "#chakra-toast-portal > *": {
      pt: "safe-top",
      pl: "safe-left",
      pr: "safe-right",
      pb: "safe-bottom",
    },
  },
};
