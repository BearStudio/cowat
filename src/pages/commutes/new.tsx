import type { NextPage } from "next";
import { Formiz, useForm, useRepeater } from "@formiz/core";
import { isMinNumber } from "@formiz/validations";
import { FieldInput } from "@/components/FieldInput";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { Button, Heading, HStack, IconButton, Stack } from "@chakra-ui/react";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { AddPlaceholder } from "@/components/AddPlaceholder";
import { FiPlus, FiTrash } from "react-icons/fi";
import { FieldSelect } from "@/components/FieldSelect";
import { Icon } from "@/components/Icon";

type CreateCommuteInput = RouterInputs["commute"]["createCommute"];
const New: NextPage = () => {
  const router = useRouter();

  const form = useForm();

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

  const handleOnValidSubmit = (values: CreateCommuteInput) => {
    console.log(values);
    createCommute.mutate(values);
  };

  return (
    <LayoutAuthenticated>
      <Formiz onValidSubmit={handleOnValidSubmit} autoForm connect={form}>
        <Stack bg="white" rounded="lg" boxShadow="card" p="8" spacing="4">
          <Heading>New Commute</Heading>
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
                  colorScheme="error"
                  aria-label={`Remove stop ${index}`}
                  icon={<FiTrash />}
                  onClick={() => stops.remove(index)}
                />
              </HStack>
              <FieldInput
                name={`stops[${index}].time`}
                placeholder="🕘 09:00"
              />
            </Stack>
          ))}
          <AddPlaceholder onClick={() => stops.append()}>
            <Icon icon={FiPlus} /> Add Stop 📍
          </AddPlaceholder>
          <Button type="submit" isDisabled={createCommute.isLoading}>
            Save
          </Button>
        </Stack>
      </Formiz>
    </LayoutAuthenticated>
  );
};

export default New;
