import { AddPlaceholder } from "@/components/AddPlaceholder";
import { FieldDayPicker } from "@/components/FieldDatePicker";
import { FieldSelect } from "@/components/FieldSelect";
import { FieldTextarea } from "@/components/FieldTextarea";
import { FieldTime } from "@/components/FieldTime";
import { FieldHidden } from "@/components/FieldHidden";
import { FieldNumber } from "@/components/FieldNumber";
import { FieldInput } from "@/components/FieldInput";
import { Icon } from "@/components/Icon";
import { LocationForm } from "@/components/LocationForm";
import type { RouterInputs, RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { getPassengers } from "@/utils/commutes";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Divider,
  Flex,
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
import {
  Formiz,
  useCollection,
  useForm,
  useFormContext,
  useFormFields,
} from "@formiz/core";
import { isMaxNumber, isMinNumber } from "@formiz/validations";
import { Plus, Trash } from "lucide-react";
import { useRouter } from "next/router";
import { Fragment } from "react";
import dayjs from "dayjs";

type CommuteFormProps = {
  repeaterInitialValues: Array<object>;
  /**
   * Defines which mode the form should have. TEMPLATE and EDIT doesn't include
   * the date selection.
   */
  mode?: "TEMPLATE" | "CREATE" | "EDIT";
  form: ReturnType<typeof useForm>;
};

type CommuteFormValues = RouterOutputs["commute"]["commuteById"];

export const CommuteForm = ({
  repeaterInitialValues: initialValues,
  mode = "CREATE",
  form,
}: CommuteFormProps) => {
  const router = useRouter();
  const { id } = router.query;

  const commute = api.commute.commuteById.useQuery(
    { id: id?.toString() ?? "" },
    {
      enabled: !!id,
    }
  );

  const values = useFormFields({
    connect: form,
    fields: ["commuteType"] as const,
    selector: "value",
  });

  const stops = useCollection("stops", {
    connect: form,
    defaultValue: initialValues,
  });

  const numberOfPassengers = getPassengers(
    commute.data?.stops ?? [],
    commute.data?.commuteType ?? "ROUND"
  ).length;

  const arePassengersOnStops = numberOfPassengers > 0;

  return (
    <>
      {["TEMPLATE"].includes(mode) && (
        <>
          <FieldInput<string>
            label="Commute name"
            name="templateName"
            type="string"
          />
        </>
      )}
      <FieldNumber
        label="💺 Seats"
        name="seats"
        required="Please provide the number of available seats"
        validations={[
          {
            handler: isMinNumber(numberOfPassengers ?? 0),
            message: `Should be a number over ${numberOfPassengers}`,
          },
          {
            handler: isMaxNumber(10),
            message: "Should be a number less than 10",
          },
        ]}
      />
      <FieldSelect
        label="Type of trip"
        name="commuteType"
        required="Please select the type of trip"
        options={[
          { value: "ROUND", label: "Round trip" },
          { value: "OUTBOUND", label: "One-way" },
          { value: "RETURN", label: "Return" },
        ]}
        defaultValue="ROUND"
      />
      {values.commuteType === "ROUND" && (
        <Flex gap={4}>
          <Flex direction="column" flex={1}>
            <FieldTime
              label="🕑 Home departure"
              name="departureTime"
              required="Please provide a departure time"
              keepValue={false}
              mb={4}
            />
            <LocationField name="departureLocation" label="📍 Home location" />
          </Flex>
          <Flex direction="column" flex={1}>
            <FieldTime
              label="🕑 Work departure"
              name="returnTime"
              required="Please provide a departure time"
              keepValue={false}
              mb={4}
            />
            <LocationField name="returnLocation" label="📍 Work location" />
          </Flex>
        </Flex>
      )}

      {values.commuteType === "OUTBOUND" && (
        <Flex>
          <FieldTime
            label="🕑 Home departure"
            name="departureTime"
            required="Please provide a departure time"
            keepValue={false}
            flex={1}
          />
          <LocationField name="departureLocation" label="📍 Home location" />
        </Flex>
      )}

      {values.commuteType === "RETURN" && (
        <Flex>
          <FieldTime
            label="🕑 Work departure"
            name="returnTime"
            required="Please provide a departure time"
            keepValue={false}
            flex={1}
          />
          <LocationField name="returnLocation" label="📍 Work location" />
        </Flex>
      )}
      {["CREATE"].includes(mode) && (
        <>
          <FieldDayPicker
            label="📆 Departure Date"
            name="date"
            required="Please provide a valid date"
            validations={[
              {
                handler: (value) => {
                  return !(
                    value && dayjs(value, "DD-MM-YYYY").isBefore(dayjs(), "day")
                  );
                },
                message: "The date you selected is in the past",
              },
            ]}
          />
        </>
      )}
      <Divider />
      {arePassengersOnStops && (
        <Alert status="info" fontSize="sm" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Some stops are not editable at the moment.</AlertTitle>
            <AlertDescription>
              Stops that other users requested can&apos;t be edited.
            </AlertDescription>
          </Box>
        </Alert>
      )}
      <>
        {stops.keys.map((key, index) => {
          const stopIndex = Number.isInteger(parseInt(key)) // index is not update when you delete stops above in the list, but key is
            ? parseInt(key)
            : index;
          const stop = commute.data?.stops[stopIndex];
          const numberOfPassengersOnStop = stop
            ? getPassengers([stop], commute.data?.commuteType ?? "ROUND")
                ?.length
            : 0;
          const isEditable = numberOfPassengersOnStop === 0;
          const isRemovable = stops.keys.length > 1 && isEditable;
          return (
            <Fragment key={key}>
              <Stop
                id={stop?.id}
                index={index}
                isEditable={isEditable}
                isRemovable={isRemovable}
                onRemove={() => stops.remove(index)}
              />
              <Divider />
            </Fragment>
          );
        })}
        <AddPlaceholder onClick={() => stops.append()}>
          <Icon icon={Plus} /> Add Stop 📍
        </AddPlaceholder>
      </>
      <FieldTextarea label="Comment" name="comment" />
    </>
  );
};

type StopProps = {
  id?: string;
  index: number;
  isRemovable?: boolean;
  isEditable?: boolean;
  onRemove: () => void;
};

const Stop = ({
  id,
  index,
  onRemove,
  isRemovable = true,
  isEditable = true,
}: StopProps) => {
  const ctx = api.useContext();
  const form = useFormContext();
  const formFields = useFormFields({
    fields: ["stops"] as const,
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
  const usedLocations = formFields.stops?.map(
    (stop: { location: string }) => stop.location
  );

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

type LocationFieldProps = {
  name: string;
  label: string;
};

const LocationField = ({ name, label }: LocationFieldProps) => {
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
      <HStack flex={1} align="flex-start" w="fit-content">
        <FieldSelect
          label={label}
          name={name}
          placeholder="Please select a location"
          options={getSelectOptions()}
          required="Location is required"
        />
        <Box pt={8}>
          <IconButton
            aria-label="Add a location"
            icon={<Icon icon={Plus} />}
            onClick={onOpen}
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
