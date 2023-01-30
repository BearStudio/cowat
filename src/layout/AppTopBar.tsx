import {
  Box,
  Flex,
  HStack,
  Heading,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const navigation = [
  { name: "Locations", href: "/locations" },
  { name: "Commutes", href: "/commutes" },
];

export const AppTopBar = () => {
  return (
    <Flex>
      <HStack
        w="full"
        spacing="2"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading
          fontWeight="black"
          as="h4"
          fontSize={{ base: "md", md: "2xl" }}
          flex="none"
        >
          <Link href="/">Cowat</Link>
        </Heading>
        <ButtonGroup variant="link" colorScheme="white" spacing="4">
          {navigation.map((link) => (
            <Button
              as={Link}
              key={link.name}
              href={link.href}
              // aria-current="page"
            >
              {link.name}
            </Button>
          ))}
        </ButtonGroup>
        <Box minW={0} textAlign="right">
          <Button onClick={() => signOut()}>Log out</Button>
        </Box>
      </HStack>
    </Flex>
  );
};
