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
import { getPassengers } from "@/utils/commutes";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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
import {
  Formiz,
  useForm,
  useFormContext,
  useFormFields,
  useRepeater,
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
};

export const CommuteForm = ({
  repeaterInitialValues: initialValues,
  mode = "CREATE",
}: CommuteFormProps) => {
  const router = useRouter();
  const { id } = router.query;

  const commute = api.commute.commuteById.useQuery(
    { id: id?.toString() ?? "" },
    {
      enabled: !!id,
    }
  );

  const form = useForm();

  const stops = useRepeater({
    name: "stops",
    connect: form,
    initialValues,
  });

  const arePassengersOnStop = commute.data?.stops.some(
    (stop) => stop.passengers.length !== 0
  );

  const numberOfPassengers = getPassengers(commute.data?.stops ?? []).length;

  return (
    <>
      <FieldInput<number>
        label="💺 Seats"
        name="seats"
        type="number"
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
        formatValue={(value) => parseInt(value ?? "", 10)}
      />
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
      {arePassengersOnStop && (
        <Alert status="info" fontSize="sm" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Stops are not editable at the moment.</AlertTitle>
            <AlertDescription>
              When users made request to be on your commute, you can&apos;t edit
              them at the moment
            </AlertDescription>
          </Box>
        </Alert>
      )}
      {!arePassengersOnStop && (
        <>
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
        </>
      )}
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
  const formFields = useFormFields({ fields: ["stops"] });

  const newLocationForm = useForm();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const locations = api.location.mine.useQuery();

  //Locations already used in a stop
  const usedLocations = formFields.stops?.map(
    (field: { location: { value: string } }) => field?.location?.value
  );

  const getSelectOptions = (index: number) => {
    // we keep as options the unused locations & the value of current stop location
    return (
      locations?.data?.filter(
        (location) =>
          !usedLocations?.includes(location.id) ||
          location.id === formFields?.stops?.[index]?.location?.value
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
          <FieldSelect
            label={`📍 Stop ${index + 1}`}
            name={`stops[${index}].location`}
            placeholder="Please select a location"
            options={
              getSelectOptions(index)?.map((location) => ({
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
