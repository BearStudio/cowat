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
  Heading,
  HStack,
  IconButton,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { ArrowLeft, ExternalLink, Plus, Trash } from "lucide-react";
import Link from "next/link";

const LocationsPage = () => {
  const myLocations = api.location.mine.useQuery();

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <HStack>
          <IconButton
            as={Link}
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            href="/account"
          />
          <Heading size="md" flex={1}>
            Locations
          </Heading>
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
          as={ChakraLink}
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
