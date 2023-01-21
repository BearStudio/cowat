import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { TopBar } from "@/components/TopBar";
import { api } from "@/utils/api";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Container,
  Flex,
  Heading,
  IconButton,
  Link,
  SimpleGrid,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { FiExternalLink, FiPlus, FiTrash } from "react-icons/fi";

const Locations: NextPage = () => {
  const ctx = api.useContext();

  const myLocations = api.location.mine.useQuery();
  const otherLocations = api.location.others.useQuery();

  const deleteLocation = api.location.delete.useMutation({
    onSuccess: () => {
      ctx.location.invalidate();
    },
  });

  return (
    <>
      <Head>
        <title>Cowat - Locations</title>
      </Head>
      <TopBar />
      <Container as="main">
        <Stack spacing="8">
          <Stack spacing="4">
            <Flex justify="space-between">
              <Heading size="lg">My Locations</Heading>
              <Button
                as={NextLink}
                href="/locations/new"
                leftIcon={<Icon icon={FiPlus} />}
              >
                Create
              </Button>
            </Flex>
            {myLocations.data?.length === 0 && (
              <EmptyState>You have no locations at the moment.</EmptyState>
            )}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {myLocations.data?.map((location) => (
                <Card key={location.id} size="sm">
                  <CardHeader>
                    <Heading size="md">{location.name}</Heading>
                  </CardHeader>
                  <CardBody>{location.address}</CardBody>
                  <CardFooter justifyContent="space-between">
                    <Button
                      as={Link}
                      href={`https://www.google.com/maps/search/${location.address}`}
                      title="Open the address on Google Maps"
                      isExternal
                      rightIcon={<Icon icon={FiExternalLink} />}
                    >
                      Maps
                    </Button>
                    <IconButton
                      colorScheme="error"
                      aria-label="Remove this location"
                      icon={<Icon icon={FiTrash} />}
                      onClick={() => deleteLocation.mutate(location.id)}
                      isLoading={deleteLocation.isLoading}
                    />
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
          <Stack spacing="4">
            <Heading size="lg">Other Locations</Heading>
            {otherLocations.data?.length === 0 && (
              <EmptyState>No other location available</EmptyState>
            )}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {otherLocations.data?.map((location) => (
                <Card key={location.id} size="sm">
                  <CardHeader>
                    <Heading size="md">{location.name}</Heading>
                  </CardHeader>
                  <CardBody>{location.address}</CardBody>
                  <CardFooter
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Button
                      as={Link}
                      href={`https://www.google.com/maps/search/${location.address}`}
                      title="Open the address on Google Maps"
                      isExternal
                      rightIcon={<Icon icon={FiExternalLink} />}
                    >
                      Maps
                    </Button>
                    <Tooltip
                      label={`Created by ${location.createdBy?.name ?? ""}`}
                    >
                      <Avatar
                        size="sm"
                        name={location.createdBy?.name ?? ""}
                        src={location.createdBy?.image ?? ""}
                      />
                    </Tooltip>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default Locations;
