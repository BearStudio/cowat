import type { FC } from "react";
import { Bell, Car, LayoutDashboard, User } from "lucide-react";
import type { FlexProps, StackProps } from "@chakra-ui/react";
import { HStack, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useIsActive } from "@/hooks/useIsActive";
import { api } from "@/utils/api";
import type { IconType } from "react-icons";

export const BottomNavBar = (props: StackProps) => {
  const requests = api.commute.allRequestsForMyCommute.useQuery();

  return (
    <HStack as="nav" {...props}>
      <NavBarItem icon={LayoutDashboard} href="/dashboard" exact>
        Dashboard
      </NavBarItem>
      <NavBarItem icon={Car} href="/commutes">
        My Commutes
      </NavBarItem>
      <NavBarItem icon={Bell} href="/requests" position="relative">
        Requests
        <Flex
          position="absolute"
          top="2"
          right="5"
          fontWeight="bold"
          color="white"
          bg="error.500"
          w="4"
          h="4"
          borderRadius="full"
          justify="center"
          align="center"
        >
          {requests.data?.length}
        </Flex>
      </NavBarItem>
      <NavBarItem icon={User} href="/account">
        Account
      </NavBarItem>
    </HStack>
  );
};

type NavBarItemProps = FlexProps & {
  href: string;
  icon: IconType;
  exact?: boolean;
};

export const NavBarItem: FC<NavBarItemProps> = ({
  href,
  children,
  icon,
  exact = false,
  ...rest
}) => {
  const isActive = useIsActive(href, exact);

  return (
    <Flex
      as={Link}
      href={href}
      cursor="pointer"
      color={isActive ? "black" : "gray.500"}
      flexDir="column"
      align="center"
      flexGrow="1"
      flexBasis="100%"
      py="2"
      pt="3"
      textAlign="center"
      {...rest}
    >
      <Icon
        fontSize="1.2rem"
        icon={icon}
        color={isActive ? "black" : "gray.400"}
      />
      <Text
        fontSize="0.55rem"
        fontWeight={isActive ? "bold" : "semibold"}
        textTransform="uppercase"
        mt="1"
      >
        {children}
      </Text>
    </Flex>
  );
};
