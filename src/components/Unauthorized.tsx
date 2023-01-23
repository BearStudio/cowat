import type { BoxProps } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

export const Unauthorized = (props: BoxProps) => {
  return (
    <Box
      bg="error.100"
      rounded="md"
      p="8"
      textAlign="center"
      fontWeight="medium"
      color="red.800"
      border="1px solid"
      borderColor="red.200"
      {...props}
    />
  );
};
