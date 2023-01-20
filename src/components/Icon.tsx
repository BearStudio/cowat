import type { FC } from "react";
import React from "react";

import type { BoxProps, IconProps as ChakraIconProps } from "@chakra-ui/react";
import { Box, Icon as ChakraIcon, forwardRef } from "@chakra-ui/react";

export type IconProps = BoxProps & {
  icon: FC<React.PropsWithChildren<unknown>>;
  iconProps?: ChakraIconProps;
};

export const Icon = forwardRef<IconProps, "span">(
  ({ icon: IconEl, iconProps, ...rest }, ref) => {
    return (
      <Box
        as="span"
        display="inline-block"
        position="relative"
        w="1em"
        flex="none"
        _before={{
          content: '"."',
          visibility: "hidden",
        }}
        ref={ref}
        {...rest}
      >
        <ChakraIcon
          as={IconEl}
          w="1em"
          h="1em"
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          {...iconProps}
        />
      </Box>
    );
  }
);
