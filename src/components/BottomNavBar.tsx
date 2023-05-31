import type { FC } from "react";
import { Bell, Car, LayoutDashboard, User, Lock } from "lucide-react";
import type { FlexProps, StackProps } from "@chakra-ui/react";
import { Box, HStack, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useIsActive } from "@/hooks/useIsActive";
import { api } from "@/utils/api";
import type { IconType } from "react-icons";
import { useSession } from "next-auth/react";

export const BottomNavBar = (props: StackProps) => {
  const requests = api.commute.allRequestsForMyCommute.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const { data: session } = useSession();

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
        {!!requests.data?.length && (
          <Flex
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(20%, -140%)"
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
        )}
      </NavBarItem>
      <NavBarItem icon={User} href="/account">
        Account
      </NavBarItem>
      {session?.user?.role === "ADMIN" && (
        <NavBarItem icon={Lock} href="/admin">
          Admin
        </NavBarItem>
      )}
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
      _dark={{ color: isActive ? "white" : "gray.400" }}
      {...rest}
    >
      <Icon
        fontSize="1.2rem"
        icon={icon}
        color={isActive ? "currentColor" : "gray.400"}
      />
      <Box
        fontSize="0.55rem"
        fontWeight={isActive ? "bold" : "semibold"}
        textTransform="uppercase"
        mt="1"
      >
        {children}
      </Box>
    </Flex>
  );
};
