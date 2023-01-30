import { FieldInput } from "@/components/FieldInput";
import { FieldTextarea } from "@/components/FieldTextarea";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Flex, Heading, Stack } from "@chakra-ui/react";
import { Formiz } from "@formiz/core";
import type { NextPage } from "next";
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
    <LayoutAuthenticated>
      <Stack
        spacing="4"
        as="main"
        boxShadow="card"
        p="8"
        bg="white"
        rounded="md"
      >
        <Flex justify="space-between">
          <Heading size="lg">New Location</Heading>
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
    </LayoutAuthenticated>
  );
};

export default Locations;
