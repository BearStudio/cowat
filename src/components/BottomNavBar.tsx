import { NavigationLink } from "@/components/NavigationLink";
import type { StackProps } from "@chakra-ui/react";
import { HStack } from "@chakra-ui/react";
import { Bell, Car, LayoutDashboard, User } from "lucide-react";

const navigations = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Commutes", href: "/commutes", icon: Car },
  { name: "Requests", href: "/requests", icon: Bell },
  { name: "Account", href: "/account", icon: User },
];

export const BottomNavBar = (props: StackProps) => {
  return (
    <HStack as="nav" {...props}>
      {navigations.map((nav) => (
        <NavigationLink key={nav.href} icon={nav.icon} href={nav.href}>
          {nav.name}
        </NavigationLink>
      ))}
    </HStack>
  );
};
