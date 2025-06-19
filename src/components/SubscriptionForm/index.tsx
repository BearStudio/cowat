import { Alert, AlertDescription, HStack, Stack, Text } from "@chakra-ui/react";
import { FieldInput } from "@/components/FieldInput";
import { FieldSelect } from "@/components/FieldSelect";

import { Events } from "@prisma/client";
import {
  DESCRIPTION_BY_FIELD,
  isValidEvent,
  FIELDS_BY_EVENT,
} from "@/utils/subscriptions";
import { useFormFields } from "@formiz/core";
import { z } from "zod";
import { Icon } from "@/components/Icon";
import { ArrowRight } from "lucide-react";

type EventQueryFieldsHelperProps = {
  event: Events;
};

export const EventQueryFieldsHelper = ({
  event,
}: EventQueryFieldsHelperProps) => {
  const returnFields = FIELDS_BY_EVENT[event];
  return (
    <Stack>
      {returnFields.map((field, index) => (
        <HStack key={index} align="flex-start">
          <Icon icon={ArrowRight} />
          <Text>
            <span style={{ fontWeight: "bold" }}>{field}: </span>
            {DESCRIPTION_BY_FIELD[field as keyof typeof DESCRIPTION_BY_FIELD]}
          </Text>
        </HStack>
      ))}
    </Stack>
  );
};

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
        options={Object.keys(Events).map((event) => ({
          value: event,
          label: event,
        }))}
        required="Event is required"
      />
      {isValidEvent(currentEvent) && (
        <Alert variant="infoGray" borderRadius="md">
          <AlertDescription>
            <strong>
              Query for this event will contains the following fields:
            </strong>
            <br />
            <EventQueryFieldsHelper event={currentEvent} />
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
      {/* <Box pt="2">
        <Button
          variant="danger"
          leftIcon={<Icon icon={Trash} />}
          onClick={() => onRemove()}
        >
          Delete this subscription
        </Button>
      </Box> */}
    </Stack>
  );
};
