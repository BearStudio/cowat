import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  IconButton,
  Link,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";
import { FiExternalLink, FiPlus, FiTrash } from "react-icons/fi";

const Locations: NextPage = () => {
  const ctx = api.useContext();

  const myLocations = api.location.mine.useQuery();

  const deleteLocation = api.location.delete.useMutation({
    onSuccess: () => {
      ctx.location.invalidate();
    },
  });

  return (
    <LayoutAuthenticated topBar={<Heading>My Locations</Heading>}>
      <Stack spacing="4" as="main">
        <Button
          as={NextLink}
          href="/locations/new"
          leftIcon={<Icon icon={FiPlus} />}
        >
          Create
        </Button>
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
    </LayoutAuthenticated>
  );
};

export default Locations;
