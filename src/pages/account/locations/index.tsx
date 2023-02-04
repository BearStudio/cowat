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
  Flex,
  Heading,
  IconButton,
  Link,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import { ExternalLink, Plus, Trash } from "lucide-react";

const AccountPage = () => {
  const ctx = api.useContext();

  const myLocations = api.location.mine.useQuery();

  const deleteLocation = api.location.delete.useMutation({
    onSuccess: () => {
      ctx.location.invalidate();
    },
  });

  return (
    <LayoutAuthenticated
      topBar={
        <Flex justify="space-between">
          <Heading>Locations</Heading>
          <IconButton
            variant="primary"
            aria-label="Create location"
            icon={<Icon icon={Plus} />}
            as={Link}
            href="/account/locations/new"
          />
        </Flex>
      }
    >
      <Stack spacing="4" as="main">
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
          ))}
        </SimpleGrid>
      </Stack>
    </LayoutAuthenticated>
  );
};

export default AccountPage;
