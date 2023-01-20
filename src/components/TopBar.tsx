import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { signIn, signOut, useSession } from "next-auth/react";

import Link from "next/link";

const navigation = [
  { name: "Stops", href: "/stops" },
  { name: "Commutes", href: "/commutes" },
];

export function TopBar() {
  const { data: sessionData } = useSession();

  return (
    <Box as="section" pb={{ base: "12", md: "24" }}>
      <Box as="nav" bg="brand.600" color="white">
        <Container py={{ base: "3", lg: "4" }}>
          <Flex justify="space-between">
            <HStack spacing="4">
              {/* <Logo /> */}

              <ButtonGroup
                variant="link"
                colorScheme="white"
                spacing="4"
                display={{ base: "none", md: "block" }}
              >
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
            </HStack>
            <Button
              colorScheme="brand"
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? sessionData.user?.name : "Sign in"}
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
