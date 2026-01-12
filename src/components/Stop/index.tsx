import { FieldSelect } from "@/components/FieldSelect";
import { FieldTime } from "@/components/FieldTime";
import { FieldHidden } from "@/components/FieldHidden";
import { Icon } from "@/components/Icon";
import { LocationForm } from "@/components/LocationForm";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import {
  Box,
  Button,
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
  Text,
} from "@chakra-ui/react";
import { Formiz, useForm, useFormContext, useFormFields } from "@formiz/core";
import { Plus, Trash } from "lucide-react";
import dayjs from "dayjs";
import { FiAlertTriangle } from "react-icons/fi";

type StopProps = {
  id?: string;
  index: number;
  isRemovable?: boolean;
  isEditable?: boolean;
  onRemove: () => void;
};

export const Stop = ({ id, index, onRemove, isEditable = true, isRemovable = true, }: StopProps) => {
  const ctx = api.useContext();
  const form = useFormContext();
  const formFields = useFormFields({
    fields: ["stops", "outwardLocation", "inwardLocation", "date"] as const,
    selector: "value",
  });

  const newLocationForm = useForm({
    onValidSubmit: (values: RouterInputs["location"]["create"]) => {
      createLocation.mutate(values);
    },
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const locations = api.location.mine.useQuery();

  // Locations already used in a stop
  const usedLocations = [
    ...(formFields.stops?.map((stop: { location: string }) => stop.location) ??
      []),
    formFields.outwardLocation,
    formFields.inwardLocation,
  ].filter(Boolean);

  const getSelectOptions = (index: number) => {
    // we keep as options the unused locations & the value of current stop location
    return (
      locations?.data?.filter(
        (location) =>
          !usedLocations?.includes(location.id) ||
          location.id === formFields.stops?.[index]?.location
      ) ?? []
    );
  };

  const createLocation = api.location.create.useMutation({
    onSuccess: async ({ id }) => {
      await ctx.location.invalidate();
      form.setValues({
        [`stops[${index}].location`]: id,
      });
      onClose();
    },
  });

  return (
    <>
      <Stack
        align="flex-start"
        direction={{ base: "column", md: "row" }}
        spacing={{ base: 2, md: 6 }}
      >
        <HStack align="flex-start" w="full">
          <FieldHidden name={`stops[${index}].id`} defaultValue={id} />
          <FieldSelect
            label={`📍 Stop ${index + 1}`}
            name={`stops[${index}].location`}
            isDisabled={!isEditable}
            placeholder="Please select a location"
            options={
              getSelectOptions(index)?.map((location) => ({
                label: location.name,
                value: location.id,
              })) ?? []
            }
          />
          <Box pt={8}>
            <IconButton
              aria-label="Add a location"
              icon={<Icon icon={Plus} />}
              isDisabled={!isEditable}
              onClick={onOpen}
            />
          </Box>
        </HStack>
        <HStack align="flex-start" spacing={{ base: 2, md: 6 }} w="full">
          <FieldTime
            label="🕑 Pick up time"
            name={`stops[${index}].time`}
            isDisabled={!isEditable}
            validations={[
              {
                handler: (value) => {
                  if (!value || !formFields.date) return false;
                  const dateWithTime = dayjs(
                    `${formFields.date} ${value}`,
                    "DD/MM/YYYY HH:mm"
                  );
                  return dateWithTime.isAfter(dayjs());
                },
                message: "Stop time must be in the future",
                deps: [formFields.date, formFields.stops],
              },
            ]}
          />
          <Box pt={8}>
            <IconButton
              variant="danger"
              aria-label={`Remove stop ${index}`}
              icon={<Icon icon={Trash} />}
              onClick={() => onRemove()}
            />
          </Box>
        </HStack>
      </Stack>
      {formFields.stops &&
        dayjs(
          `${formFields.date} ${formFields.stops[index]?.time}`,
          "DD/MM/YYYY HH:mm"
        ).isBefore(dayjs()) && (
          <Text color="error.600" _dark={{ color: "error.400" }} fontSize="sm">
            <Icon icon={FiAlertTriangle} me="1" />
            The stop is in the past
          </Text>
        )}
      {isOpen && (
        <Modal isOpen onClose={onClose} size="sm">
          <ModalOverlay />
          <Formiz connect={newLocationForm}>
            <ModalContent>
              <ModalHeader flex="1">New location</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <LocationForm />
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="primary"
                  isLoading={createLocation.isLoading}
                  onClick={() => newLocationForm.submit()}
                >
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Formiz>
        </Modal>
      )}
    </>
  );
};
