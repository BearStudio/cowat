import type { FC } from "react";

import type { FlexProps } from "@chakra-ui/react";
import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import type { IconType } from "react-icons";

import { Icon } from "@/components/Icon";
import { useIsActive } from "@/hooks/useIsActive";

type NavigationLinkProps = FlexProps & {
  href: string;
  icon: IconType;
  exact?: boolean;
};

export const NavigationLink: FC<NavigationLinkProps> = ({
  href,
  children,
  icon,
  exact = true,
  ...rest
}) => {
  const isActive = useIsActive(href, exact);

  return (
    <Flex
      as={Link}
      href={href}
      cursor="pointer"
      color={isActive ? "black" : "gray.600"}
      flexDir="column"
      align="center"
      flexGrow="1"
      flexBasis="100%"
      p="2"
      pt="3"
      {...rest}
    >
      <Icon fontSize="1.2rem" icon={icon} />
      <Text
        fontSize="0.55rem"
        fontWeight="bold"
        textTransform="uppercase"
        mt="1"
      >
        {children}
      </Text>
    </Flex>
  );
};
