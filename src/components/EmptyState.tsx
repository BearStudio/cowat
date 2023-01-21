import type { BoxProps } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

export const EmptyState = (props: BoxProps) => {
  return (
    <Box
      bg="blackAlpha.200"
      rounded="md"
      p="8"
      textAlign="center"
      fontWeight="medium"
      {...props}
    />
  );
};
