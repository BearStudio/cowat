import { Alert, AlertDescription, Stack } from "@chakra-ui/react";
import { FieldInput } from "@/components/FieldInput";
import { FieldSelect } from "@/components/FieldSelect";

import { Events } from "@prisma/client";
import { EVENTS_DETAILS, isValidEvent } from "@/utils/subscriptions";
import { useFormFields } from "@formiz/core";
import { z } from "zod";
import { SubscriptionHelper } from "@/components/SubscriptionForm/SubscriptionHelper";

export const SubscriptionForm = () => {
  const fields = useFormFields();
  const currentEvent = fields?.triggeringEvent?.value;
  return (
    <Stack>
      <FieldInput
        name="name"
        label="Name"
        placeholder="New subscription"
        required="Name is required"
        pt="2"
      />
      <FieldSelect
        label="Event"
        name="triggeringEvent"
        placeholder="Please select an event"
        options={Object.values(Events).map((event) => ({
          value: event,
          label: EVENTS_DETAILS[event].label,
        }))}
        required="Event is required"
      />
      {isValidEvent(currentEvent) && (
        <Alert variant="infoGray" borderRadius="md">
          <AlertDescription>
            <SubscriptionHelper event={currentEvent} />
          </AlertDescription>
        </Alert>
      )}
      <FieldInput
        name="url"
        label="URL"
        placeholder="https://my.webhook.com/listener"
        required="URL is required"
        validations={[
          {
            handler: (value) => z.string().url().safeParse(value).success,
            message: "URL is not valid",
          },
        ]}
        pt="2"
      />
    </Stack>
  );
};
