import { Icon } from "@/components/Icon";
import { Button, Center } from "@chakra-ui/react";
import type { InferGetServerSidePropsType } from "next";
import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaDiscord } from "react-icons/fa";

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
      {Object.values(providers ?? {}).map((provider) => (
        <Center h="100vh" key={provider.name}>
          <Button
            colorScheme="brand"
            onClick={() => signIn(provider.id)}
            leftIcon={<Icon icon={FaDiscord} />}
          >
            Sign in with {provider.name}
          </Button>
        </Center>
      ))}
    </>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
