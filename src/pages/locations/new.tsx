import { FieldInput } from "@/components/FieldInput";
import { FieldTextarea } from "@/components/FieldTextarea";
import { TopBar } from "@/components/TopBar";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Container, Flex, Heading, Stack } from "@chakra-ui/react";
import { Formiz } from "@formiz/core";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

type CreateLocationInput = RouterInputs["location"]["create"];

const Locations: NextPage = () => {
  const router = useRouter();

  const location = api.location.create.useMutation({
    onSuccess: () => {
      router.push("/locations");
    },
  });

  const handleOnValidSubmit = (values: CreateLocationInput) => {
    location.mutate(values);
  };

  return (
    <>
      <Head>
        <title>Cowat - Locations</title>
      </Head>
      <TopBar />
      <Container as="main">
        <Stack spacing="4">
          <Flex justify="space-between">
            <Heading size="lg">Create Location</Heading>
          </Flex>
          <Formiz autoForm onValidSubmit={handleOnValidSubmit}>
            <Stack>
              <FieldInput
                label="Name"
                name="name"
                required="Please provide a name"
              />
              <FieldTextarea
                label="Address"
                name="address"
                required="Please provide an address"
              />
              <Button type="submit">Save</Button>
            </Stack>
          </Formiz>
        </Stack>
      </Container>
    </>
  );
};

export default Locations;
