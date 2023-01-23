import type { NextPage } from "next";
import { Formiz } from "@formiz/core";
import { isMinNumber } from "@formiz/validations";
import { FieldInput } from "@/components/FieldInput";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { Button, Heading, Stack } from "@chakra-ui/react";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

type CreateCommuteInput = RouterInputs["commute"]["createCommute"];
const New: NextPage = () => {
  const router = useRouter();

  const createCommute = api.commute.createCommute.useMutation({
    onSuccess: () => {
      router.push("/commutes");
    },
  });

  const handleOnValidSubmit = (values: CreateCommuteInput) => {
    createCommute.mutate(values);
  };

  return (
    <LayoutAuthenticated>
      <Heading>New Commute</Heading>
      <Formiz onValidSubmit={handleOnValidSubmit} autoForm>
        <Stack>
          <FieldInput
            label="Seats"
            name="seats"
            type="number"
            required
            validations={[
              {
                rule: isMinNumber(0),
                message: "Should be a number over 10",
              },
            ]}
            formatValue={(value) => parseInt(value, 10)}
          />
          <FieldInput
            label="Date and Time"
            name="date"
            type="datetime-local"
            formatValue={(value) => new Date(value)}
            required
          />

          <Button type="submit" isDisabled={createCommute.isLoading}>
            Save
          </Button>
        </Stack>
      </Formiz>
    </LayoutAuthenticated>
  );
};

export default New;
