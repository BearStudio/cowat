import type { BoxProps } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

export const EmptyState = (props: BoxProps) => {
  return (
    <Box
      bg="gray.100"
      border="1px dashed"
      color="gray.600"
      borderColor="gray.300"
      rounded="md"
      fontSize="sm"
      p="8"
      textAlign="center"
      fontWeight="medium"
      {...props}
    />
  );
};
