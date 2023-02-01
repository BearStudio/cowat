import { NavigationLink } from "@/components/NavigationLink";
import type { StackProps } from "@chakra-ui/react";
import { Box, Button, HStack } from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import { FiLayout, FiMapPin, FiNavigation } from "react-icons/fi";

const navigations = [
  { name: "Dashboard", href: "/dashboard", icon: FiLayout },
  { name: "Locations", href: "/locations", icon: FiMapPin },
  { name: "Commutes", href: "/commutes", icon: FiNavigation },
];

export const BottomNavBar = (props: StackProps) => {
  return (
    <HStack as="nav" {...props}>
      {navigations.map((nav) => (
        <NavigationLink key={nav.href} icon={nav.icon} href={nav.href}>
          {nav.name}
        </NavigationLink>
      ))}
      <Box>
        <Button onClick={() => signOut()}>Log out</Button>
      </Box>
    </HStack>
  );
};
