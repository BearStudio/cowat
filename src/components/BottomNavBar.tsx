import { NavigationLink } from "@/components/NavigationLink";
import type { StackProps } from "@chakra-ui/react";
import { HStack } from "@chakra-ui/react";
import { Bell, Car, LayoutDashboard, User } from "lucide-react";

const navigations = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "My Commutes", href: "/commutes", icon: Car, exact: false },
  { name: "Requests", href: "/requests", icon: Bell, exact: false },
  { name: "Account", href: "/account", icon: User, exact: false },
];

export const BottomNavBar = (props: StackProps) => {
  return (
    <HStack as="nav" {...props}>
      {navigations.map((nav) => (
        <NavigationLink
          key={nav.href}
          icon={nav.icon}
          href={nav.href}
          exact={nav.exact}
        >
          {nav.name}
        </NavigationLink>
      ))}
    </HStack>
  );
};
