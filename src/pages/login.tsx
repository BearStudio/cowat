import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Link,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import signInImage from "@/images/signin.jpg";

export default function SignIn() {
  const router = useRouter();
  const { status } = useSession();

  if (status === "authenticated") {
    router.push("/dashboard");
  }

  return (
    <>
      <Head>
        <title>Cowat - Login</title>
      </Head>
      <Flex direction={{ base: "column-reverse", md: "row" }} height="100vh">
        <Flex direction="column" h="full" flex="1">
          <Center flex="1">
            <Stack
              spacing={{ base: 2, sm: 4, md: 8 }}
              divider={<StackDivider />}
            >
              <Stack fontFamily="serif" textAlign="center">
                <Heading as="h1" fontSize={{ base: "3xl", md: "6xl" }}>
                  COWAT
                </Heading>
              </Stack>

              <Button colorScheme="brand" onClick={() => signIn("slack")}>
                Sign in with Slack
              </Button>
            </Stack>
          </Center>
          <Box alignSelf="flex-end" mr="2" fontSize="xs" textAlign="right">
            <Text>
              Photo by{" "}
              <Link
                isExternal
                href="https://unsplash.com/@juniorreisfoto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
              >
                Junior REIS
              </Link>{" "}
              on{" "}
              <Link
                isExternal
                href="https://unsplash.com/photos/jgvKWT2iRtw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
              >
                Unsplash
              </Link>
            </Text>
            <Text>
              Cowat is proudly developed by{" "}
              <Link isExternal href="https://twitter.com/YoannFleuryDev">
                @yoannfleurydev
              </Link>
            </Text>
          </Box>
        </Flex>

        <Flex flex="1" justify="flex-end">
          <Box
            flex="1"
            as={Image}
            w={{ base: "100vw", md: "auto" }}
            maxH={{ base: "50vh", md: "100vh" }}
            h={{ base: "auto", md: "100vh" }}
            src={signInImage}
            objectFit="cover"
            alt="Woman smiling at her phone in a car"
            placeholder="blur"
          />
        </Flex>
      </Flex>
    </>
  );
}
