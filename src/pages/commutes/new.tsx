import type { NextPage } from "next";
import { Formiz, useForm, useFormContext, useRepeater } from "@formiz/core";
import { isMinNumber } from "@formiz/validations";
import { FieldInput } from "@/components/FieldInput";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Divider,
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
import { FieldTextarea } from "@/components/FieldTextarea";
import { FieldTime } from "@/components/FieldTime";
import { Fragment } from "react";
import { FieldDayPicker } from "@/components/FieldDatePicker";
import "react-day-picker/dist/style.css";
import dayjs, { Dayjs } from "dayjs";

type CreateCommuteInput = RouterInputs["commute"]["createCommute"];
const New: NextPage = () => {
  const defaultValues = {
    stops: [{}],
  };

  const router = useRouter();
  const form = useForm();

  const stops = useRepeater({
    name: "stops",
    connect: form,
    initialValues: defaultValues.stops,
  });

  const createCommute = api.commute.createCommute.useMutation({
    onSuccess: async () => {
      await router.push("/commutes");
    },
  });

  const handleOnValidSubmit = (
    values: Omit<CreateCommuteInput, "date"> & { date: Dayjs; time: string }
  ) => {
    const { date, time, ...otherValues } = values;

    createCommute.mutate({
      ...otherValues,
      date: dayjs(`${date.format("YYYY-MM-DD")} ${time}`).toDate(),
    });
  };

  return (
    <LayoutAuthenticated
      hideNav
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
      <Formiz
        onValidSubmit={handleOnValidSubmit}
        autoForm
        connect={form}
        initialValues={defaultValues}
      >
        <Stack bg="white" rounded="lg" boxShadow="card" p="8" spacing="4">
          <FieldInput
            label="💺 Seats"
            name="seats"
            type="number"
            required="Please provide the number of available seats"
            validations={[
              {
                handler: isMinNumber(0),
                message: "Should be a number over 10",
              },
            ]}
            formatValue={(value) => parseInt(value ?? "", 10)}
          />
          <FieldDayPicker
            label="📆 Departure Date"
            name="date"
            required="Please provide a date"
            validations={[
              {
                handler: (value: Dayjs) => value.isValid(),
                message: "You must provide a correct date",
              },
            ]}
          />
          <FieldTime
            label="🕘 Departure Time"
            name="time"
            required="Please provide a departure time"
          />
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
            <Icon icon={FiPlus} /> Add Stop 📍
          </AddPlaceholder>
          <FieldTextarea label="Comment" name="comment" />
          <Button
            variant="primary"
            type="submit"
            isLoading={createCommute.isLoading}
          >
            Save
          </Button>
        </Stack>
      </Formiz>
    </LayoutAuthenticated>
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
          <FieldTime label="🕑 Pick up time" name={`stops[${index}].time`} />
          <Box pt={8}>
            <IconButton
              variant="danger"
              aria-label={`Remove stop ${index}`}
              icon={<FiTrash />}
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

export default New;
