import { Icon } from "@/components/Icon";
import { LocationForm } from "@/components/LocationForm";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Heading, HStack, IconButton, Stack } from "@chakra-ui/react";
import { Formiz } from "@formiz/core";
import { ArrowLeft } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

type CreateLocationInput = RouterInputs["location"]["create"];

const Locations: NextPage = () => {
  const router = useRouter();

  const location = api.location.create.useMutation({
    onSuccess: () => {
      router.push("/account/locations");
    },
  });

  const handleOnValidSubmit = (values: CreateLocationInput) => {
    location.mutate(values);
  };

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <HStack>
          <IconButton
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            as={Link}
            href="/account/locations"
          />
          <Heading size="md">New Location</Heading>
        </HStack>
      }
    >
      <Head>
        <title>Cowat - New Location</title>
      </Head>
      <Stack
        spacing="4"
        as="main"
        boxShadow="card"
        p="4"
        bg="white"
        rounded="md"
      >
        <Formiz autoForm onValidSubmit={handleOnValidSubmit}>
          <Stack>
            <LocationForm />
            <Button variant="primary" type="submit">
              Save
            </Button>
          </Stack>
        </Formiz>
      </Stack>
    </LayoutAuthenticated>
  );
};

export default Locations;
