import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { ExternalLink, Plus, Trash } from "lucide-react";

const LocationsPage = () => {
  const myLocations = api.location.mine.useQuery();

  return (
    <LayoutAuthenticated
      topBar={
        <HStack justify="space-between">
          <Heading size="md">Locations</Heading>
          <IconButton
            size="sm"
            variant="primary"
            aria-label="Create location"
            icon={<Icon icon={Plus} />}
            as={Link}
            href="/account/locations/new"
          />
        </HStack>
      }
    >
      <Stack spacing="4" as="main">
        {myLocations.data?.length === 0 && (
          <EmptyState>You have no locations at the moment.</EmptyState>
        )}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
          {myLocations.data?.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </SimpleGrid>
      </Stack>
    </LayoutAuthenticated>
  );
};

type LocationCardProps = {
  location: RouterOutputs["location"]["mine"][number];
};

const LocationCard = ({ location }: LocationCardProps) => {
  const ctx = api.useContext();
  const deleteLocation = api.location.delete.useMutation({
    onSuccess: () => {
      ctx.location.invalidate();
    },
  });

  return (
    <Card size="sm">
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
          rightIcon={<Icon icon={ExternalLink} />}
        >
          Maps
        </Button>
        <IconButton
          variant="danger"
          aria-label="Remove this location"
          icon={<Icon icon={Trash} />}
          onClick={() => deleteLocation.mutate(location.id)}
          isLoading={deleteLocation.isLoading}
        />
      </CardFooter>
    </Card>
  );
};

export default LocationsPage;
