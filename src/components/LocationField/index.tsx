import { FieldSelect } from "@/components/FieldSelect";
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
  useDisclosure,
} from "@chakra-ui/react";
import { Formiz, useForm, useFormContext } from "@formiz/core";
import { Plus } from "lucide-react";

type LocationFieldProps = {
  name: string;
  label: string;
  isEditable?: boolean;
};

export const LocationField = ({ name, label, isEditable = true }: LocationFieldProps) => {
  const ctx = api.useContext();
  const form = useFormContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const newLocationForm = useForm({
    onValidSubmit: (values: RouterInputs["location"]["create"]) => {
      createLocation.mutate(values);
    },
  });

  const locations = api.location.mine.useQuery();

  const getSelectOptions = () =>
    locations?.data?.map((location) => ({
      label: location.name,
      value: location.id,
    })) ?? [];

  const createLocation = api.location.create.useMutation({
    onSuccess: async ({ id }) => {
      await ctx.location.invalidate();
      form.setValues({
        [name]: id,
      });
      onClose();
    },
  });

  return (
    <>
      <HStack flex={1} align="flex-start" w="full">
        <FieldSelect
          label={label}
          name={name}
          placeholder="Please select a location"
          options={getSelectOptions()}
          required="Location is required"
          isDisabled={isEditable}
        />
        <Box pt={8}>
          <IconButton
            aria-label="Add a location"
            icon={<Icon icon={Plus} />}
            onClick={onOpen}
            isDisabled={isEditable}
          />
        </Box>
      </HStack>

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
