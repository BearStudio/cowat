import { Button, Center, Stack } from "@chakra-ui/react";
import type { InferGetServerSidePropsType } from "next";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { status } = useSession();

  if (status === "authenticated") {
    router.push("/dashboard");
  }

  return (
    <>
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

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
