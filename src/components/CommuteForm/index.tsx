import { AddPlaceholder } from "@/components/AddPlaceholder";
import { FieldDayPicker } from "@/components/FieldDatePicker";
import { FieldTextarea } from "@/components/FieldTextarea";
import { FieldTime } from "@/components/FieldTime";
import { FieldNumber } from "@/components/FieldNumber";
import { FieldInput } from "@/components/FieldInput";
import { FieldCheckbox } from "@/components/FieldCheckbox";
import { Icon } from "@/components/Icon";
import { api } from "@/utils/api";
import { getAllPassengers } from "@/utils/commutes";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { useCollection, useFormContext, useFormFields } from "@formiz/core";
import { isMaxNumber, isMinNumber } from "@formiz/validations";
import { Plus } from "lucide-react";
import { useRouter } from "next/router";
import { Fragment, useEffect } from "react";
import dayjs from "dayjs";
import { LocationField } from "@/components/LocationField";
import { Stop } from "@/components/Stop";

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
  const form = useFormContext();
  const { id } = router.query;

  const commute = api.commute.commuteById.useQuery(
    { id: id?.toString() ?? "" },
    {
      enabled: !!id,
    }
  );

  const values = useFormFields({
    fields: ["commuteType", "stops", "outwardTime", "inwardTime"] as const,
    selector: "value",
  });

  const stops = useCollection("stops", {
    defaultValue: mode === "TEMPLATE" ? [] : initialValues,
  });

  const numberOfPassengers = commute.isSuccess
    ? getAllPassengers(commute.data?.stops ?? []).length
    : 0;

  const numberOfPassengersOutward = (() => {
    if (commute.isSuccess) {
      const outwardStop = commute.data?.stops?.[0];
      return outwardStop ? getAllPassengers([outwardStop]).length : 0;
    }
    return 0;
  })();

  const numberOfPassengersInward = (() => {
    if (commute.isSuccess) {
      const inwardStop = commute.data?.stops?.at(-1);
      return inwardStop ? getAllPassengers([inwardStop]).length : 0;
    }
    return 0;
  })();

  const arePassengersOnStops = numberOfPassengers > 0;
  const arePassengersOnStopsOutward = numberOfPassengersOutward > 0;
  const arePassengersOnStopsInward = numberOfPassengersInward > 0;

  const stopTimes = (values.stops ?? []).map(
    (stop: { time: string }) => stop?.time
  );

  useEffect(() => {
    form.setValues({
      outwardTime: values.outwardTime,
      inwardTime: values.inwardTime,
    });
  });

  const firstStopTime = stopTimes[0];
  const lastStopTime = stopTimes.at(-1);

  const validateOutwardTime = (value?: string) => {
    if (value || firstStopTime) {
      const outward = dayjs(value, "HH:mm");
      const firstStop = dayjs(firstStopTime, "HH:mm");
      return outward.isBefore(firstStop);
    }
    return true;
  };

  const validateInwardTime = (value?: string) => {
    if (value || lastStopTime) {
      const inward = dayjs(value, "HH:mm");
      const lastStop = dayjs(lastStopTime, "HH:mm");
      return inward.isAfter(lastStop);
    }
    return true;
  };

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
      <Flex flex={1} direction={{ base: "column", md: "row" }} gap={6}>
        {/* Outward : for the departure */}
        <LocationField
          name="outwardLocation"
          label="📍 Outward location"
          isDisabled={arePassengersOnStopsOutward}
        />
        <FieldTime
          label="🕑 Outward time"
          name="outwardTime"
          required="Please provide an outward time"
          isDisabled={arePassengersOnStopsOutward}
          flex={1}
          validations={[
            {
              handler: validateOutwardTime,
              message: "Outward time must be before the first stop",
            },
          ]}
        />
      </Flex>
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
          const stop = commute.data?.stops.find(
            (stop) => stop.id === values.stops?.[index]?.id
          );
          const numberOfPassengersOnStop = stop
            ? getAllPassengers([stop]).length
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
      <FieldCheckbox
        label="🚗 Round trip"
        name="commuteType"
        formatValue={(checked) => (checked ? "ROUND" : "ONEWAY")}
      />
      {values.commuteType === "ROUND" && (
        <Flex flex={1} direction={{ base: "column", md: "row" }} gap={6}>
          {/* Inward : for the return */}
          <LocationField
            name="inwardLocation"
            label="📍 Inward location"
            isDisabled={arePassengersOnStopsInward}
          />
          <FieldTime
            label="🕑 Inward time"
            name="inwardTime"
            required="Please provide a inward time"
            isDisabled={arePassengersOnStopsInward}
            flex={1}
            validations={[
              {
                handler: validateInwardTime,
                message: "Inward time must be after the last stop",
              },
            ]}
          />
        </Flex>
      )}
      <FieldTextarea label="Comment" name="comment" />
    </>
  );
};
