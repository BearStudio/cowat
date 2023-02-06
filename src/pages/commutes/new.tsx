import type { NextPage } from "next";
import { Formiz, useForm, useRepeater } from "@formiz/core";
import { isMinNumber } from "@formiz/validations";
import { FieldInput } from "@/components/FieldInput";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import {
  Button,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { AddPlaceholder } from "@/components/AddPlaceholder";
import { FiPlus, FiTrash } from "react-icons/fi";
import { FieldSelect } from "@/components/FieldSelect";
import { Icon } from "@/components/Icon";
import { ArrowLeft, Plus } from "lucide-react";
import { LocationForm } from "@/components/LocationForm";

type CreateCommuteInput = RouterInputs["commute"]["createCommute"];
const New: NextPage = () => {
  const router = useRouter();

  const form = useForm();
  const ctx = api.useContext();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const stops = useRepeater({
    name: "stops",
    connect: form,
  });

  const createCommute = api.commute.createCommute.useMutation({
    onSuccess: () => {
      router.push("/commutes");
    },
  });

  const locations = api.location.mine.useQuery();

  const location = api.location.create.useMutation({
    onSuccess: () => {
      ctx.location.invalidate();
      onClose();
    },
  });

  const handleOnValidSubmit = (values: CreateCommuteInput) => {
    createCommute.mutate(values);
  };

  return (
    <LayoutAuthenticated
      topBar={
        <HStack>
          <IconButton
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            onClick={() => router.back()}
          />
          <Heading size="md">New commute</Heading>
        </HStack>
      }
    >
      <Formiz onValidSubmit={handleOnValidSubmit} autoForm connect={form}>
        <Stack bg="white" rounded="lg" boxShadow="card" p="8" spacing="4">
          <FieldInput
            label="💺 Seats"
            name="seats"
            type="number"
            required
            validations={[
              {
                handler: isMinNumber(0),
                message: "Should be a number over 10",
              },
            ]}
            formatValue={(value) => parseInt(value ?? "", 10)}
          />
          <FieldInput
            label="📆 Departure"
            name="date"
            type="datetime-local"
            formatValue={(value) => new Date(value ?? "")}
            required
          />
          {stops.keys.map((key, index) => (
            <Stack key={key}>
              <HStack align="end">
                <FieldSelect
                  label={`📍 Stop ${index + 1}`}
                  name={`stops[${index}].location`}
                  placeholder="Please select a location"
                  options={
                    locations.data?.map((location) => ({
                      label: location.name,
                      value: location.id,
                    })) ?? []
                  }
                  required="Stop is required"
                />
                <IconButton
                  aria-label="Add a location"
                  icon={<Icon icon={Plus} />}
                  onClick={onOpen}
                />
              </HStack>
              <HStack align="end">
                <FieldInput
                  name={`stops[${index}].time`}
                  placeholder="🕘 09:00"
                />
                <IconButton
                  variant="danger"
                  aria-label={`Remove stop ${index}`}
                  icon={<FiTrash />}
                  onClick={() => stops.remove(index)}
                />
              </HStack>
            </Stack>
          ))}
          <AddPlaceholder onClick={() => stops.append()}>
            <Icon icon={FiPlus} /> Add Stop 📍
          </AddPlaceholder>
          <Button
            variant="primary"
            type="submit"
            isDisabled={createCommute.isLoading}
          >
            Save
          </Button>
        </Stack>
      </Formiz>

      {isOpen && (
        <Modal isOpen onClose={onClose} size="sm">
          <ModalOverlay />
          <Formiz
            autoForm
            onValidSubmit={(values: RouterInputs["location"]["create"]) =>
              location.mutate(values)
            }
          >
            <ModalContent>
              <ModalHeader>New location</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <LocationForm />
              </ModalBody>

              <ModalFooter>
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Formiz>
        </Modal>
      )}
    </LayoutAuthenticated>
  );
};

export default New;
