import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LocationForm } from "@/components/LocationForm";
import { searchOnMaps } from "@/constants/google";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import type { RouterInputs, RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link as ChakraLink,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Formiz, useForm } from "@formiz/core";
import { ArrowLeft, ExternalLink, Pencil, Plus, Trash } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

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
      <Head>
        <title>Cowat - Locations</title>
      </Head>
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
  const router = useRouter();

  const deleteLocation = api.location.delete.useMutation({
    onSuccess: () => {
      ctx.location.invalidate();
    },
  });

  const editLocationForm = useForm();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const defaultValues = {
    ...location,
  };

  const LocationMutation = api.location.edit.useMutation({
    onSuccess: () => {
      router.push("/account/locations");
      onClose();
      window.location.reload();
    },
  });

  const handleOnValidSubmit = (values: RouterInputs["location"]["edit"]) => {
    LocationMutation.mutate({ ...values, id: location.id?.toString() ?? "" });
  };

  return (
    <Card size="sm">
      <CardHeader>
        <Heading size="md">{location.name}</Heading>
      </CardHeader>
      <CardBody>{location.address}</CardBody>
      <CardFooter justifyContent="space-between">
        <Flex gap="4">
          <IconButton
            aria-label="Edit location"
            icon={<Icon icon={Pencil} />}
            onClick={onOpen}
          />
          <Button
            as={ChakraLink}
            href={searchOnMaps(location.address)}
            title="Open the address on Google Maps"
            isExternal
            rightIcon={<Icon icon={ExternalLink} />}
          >
            Maps
          </Button>
        </Flex>
        <ConfirmModal
          onConfirm={() => deleteLocation.mutate(location.id)}
          title="Delete this location?"
          message={
            <Stack pt={2}>
              <Divider />
              <HStack>
                <Text>📍</Text>
                <Stack spacing={0}>
                  <Text fontWeight="bold">{location.name}</Text>
                  <Text fontSize="sm" color="gray.500" wordBreak="break-word">
                    {location.address}
                  </Text>
                </Stack>
              </HStack>
              <Divider />
            </Stack>
          }
          confirmText="Delete"
          confirmVariant="danger"
        >
          <IconButton
            variant="danger"
            aria-label="Remove this location"
            icon={<Icon icon={Trash} />}
            isLoading={deleteLocation.isLoading}
          />
        </ConfirmModal>
        {isOpen && (
          <Modal isOpen onClose={onClose} size="sm">
            <ModalOverlay />
            <Formiz
              connect={editLocationForm}
              initialValues={defaultValues}
              onValidSubmit={handleOnValidSubmit}
            >
              <ModalContent>
                <ModalHeader flex="1">Edit location</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <LocationForm />
                </ModalBody>

                <ModalFooter>
                  <Button
                    variant="primary"
                    isLoading={LocationMutation.isLoading}
                    onClick={() => editLocationForm.submit()}
                  >
                    Save
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Formiz>
          </Modal>
        )}
      </CardFooter>
    </Card>
  );
};

export default LocationsPage;
