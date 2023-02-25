import { Button, Center, Stack } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

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
      <Center h="100vh">
        <Stack spacing="8">
          <Button colorScheme="brand" onClick={() => signIn("slack")}>
            Sign in with Slack
          </Button>
        </Stack>
      </Center>
    </>
  );
}
