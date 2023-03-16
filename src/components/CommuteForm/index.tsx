import { AddPlaceholder } from "@/components/AddPlaceholder";
import { FieldDayPicker } from "@/components/FieldDatePicker";
import { FieldInput } from "@/components/FieldInput";
import { FieldSelect } from "@/components/FieldSelect";
import { FieldTextarea } from "@/components/FieldTextarea";
import { FieldTime } from "@/components/FieldTime";
import { Icon } from "@/components/Icon";
import { LocationForm } from "@/components/LocationForm";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import {
  Box,
  Button,
  Divider,
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
import { Formiz, useForm, useFormContext, useRepeater } from "@formiz/core";
import { isMaxNumber, isMinNumber } from "@formiz/validations";
import { Plus, Trash } from "lucide-react";
import { Fragment } from "react";

type CommuteFormProps = {
  repeaterInitialValues: Array<object>;
  mode?: "TEMPLATE" | "CREATE";
};

export const CommuteForm = ({
  repeaterInitialValues: initialValues,
  mode = "CREATE",
}: CommuteFormProps) => {
  const form = useForm();

  const stops = useRepeater({
    name: "stops",
    connect: form,
    initialValues,
  });

  return (
    <>
      <FieldInput<number>
        label="💺 Seats"
        name="seats"
        type="number"
        required="Please provide the number of available seats"
        validations={[
          {
            handler: isMinNumber(0),
            message: "Should be a number over 0",
          },
          {
            handler: isMaxNumber(10),
            message: "Should be a number less than 10",
          },
        ]}
        formatValue={(value) => parseInt(value ?? "", 10)}
      />
      {["CREATE"].includes(mode) && (
        <>
          <FieldDayPicker
            label="📆 Departure Date"
            name="date"
            required="Please provide a valid date"
          />
        </>
      )}
      <Divider />
      {stops.keys.map((key, index) => (
        <Fragment key={key}>
          <Stop
            index={index}
            isRemovable={stops.keys.length > 1}
            onRemove={() => stops.remove(index)}
          />
          <Divider />
        </Fragment>
      ))}
      <AddPlaceholder onClick={() => stops.append()}>
        <Icon icon={Plus} /> Add Stop 📍
      </AddPlaceholder>
      <FieldTextarea label="Comment" name="comment" />
    </>
  );
};

type StopProps = {
  index: number;
  isRemovable?: boolean;
  onRemove: () => void;
};

const Stop = ({ index, onRemove, isRemovable }: StopProps) => {
  const ctx = api.useContext();
  const form = useFormContext();
  const newLocationForm = useForm();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const locations = api.location.mine.useQuery();

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
          <Box pt={8}>
            <IconButton
              aria-label="Add a location"
              icon={<Icon icon={Plus} />}
              onClick={onOpen}
            />
          </Box>
        </HStack>
        <HStack align="flex-start" spacing={{ base: 2, md: 6 }} w="full">
          <FieldTime
            label="🕑 Pick up time"
            name={`stops[${index}].time`}
            required={
              index === 0 ? "The first pick up time is required" : false
            }
          />
          <Box pt={8}>
            <IconButton
              variant="danger"
              aria-label={`Remove stop ${index}`}
              icon={<Icon icon={Trash} />}
              onClick={() => onRemove()}
              isDisabled={!isRemovable}
            />
          </Box>
        </HStack>
      </Stack>
      {isOpen && (
        <Modal isOpen onClose={onClose} size="sm">
          <ModalOverlay />
          <Formiz
            connect={newLocationForm}
            onValidSubmit={(values: RouterInputs["location"]["create"]) => {
              createLocation.mutate(values);
            }}
          >
            <ModalContent>
              <ModalHeader>New location</ModalHeader>
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
