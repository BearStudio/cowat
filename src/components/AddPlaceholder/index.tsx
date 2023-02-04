import type { FC } from "react";
import type { ButtonProps } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

export const AddPlaceholder: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <Button
      role="group"
      my="6"
      w="full"
      h="auto"
      display="flex"
      justifyContent="center"
      p="4"
      bg="gray.50"
      border="1px dashed"
      borderColor="gray.200"
      borderRadius="md"
      transition="0.2s"
      _hover={{ borderColor: "gray.400" }}
      _active={{ bg: "gray.200" }}
      _dark={{
        bg: "gray.900",
        borderColor: "gray.700",
        _hover: { borderColor: "gray.600" },
        _active: { bg: "gray.800" },
      }}
      _focusVisible={{
        shadow: "none",
        ring: "2px",
        ringColor: "gray.900",
        ringOffset: "2px",
        ringOffsetColor: "white",
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
