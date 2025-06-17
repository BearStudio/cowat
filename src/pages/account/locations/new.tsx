import { SimpleCard } from "@/components/SimpleCard";
import { Icon } from "@/components/Icon";
import { LocationForm } from "@/components/LocationForm";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Heading, HStack, IconButton } from "@chakra-ui/react";
import { Formiz, useForm } from "@formiz/core";
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

  const createLocationForm = useForm({
    onValidSubmit: handleOnValidSubmit,
  });

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
      <Formiz autoForm connect={createLocationForm}>
        <SimpleCard>
          <LocationForm />
          <Button variant="primary" type="submit">
            Save
          </Button>
        </SimpleCard>
      </Formiz>
    </LayoutAuthenticated>
  );
};

export default Locations;
