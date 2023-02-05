import { Icon } from "@/components/Icon";
import { LocationForm } from "@/components/LocationForm";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import {
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { Formiz } from "@formiz/core";
import { ArrowLeft } from "lucide-react";
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
    <LayoutAuthenticated
      topBar={
        <HStack>
          <IconButton
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            onClick={() => router.back()}
          />
          <Heading>New Location</Heading>
        </HStack>
      }
    >
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
