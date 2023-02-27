import type { StackProps } from "@chakra-ui/react";
import { Stack } from "@chakra-ui/react";

export const SimpleCard = (props: StackProps) => {
  return (
    <Stack
      spacing="4"
      as="main"
      p="4"
      bg="white"
      borderRadius="md"
      boxShadow="card"
      {...props}
      _dark={{ bg: "gray.800", ...props._dark }}
    />
  );
};
