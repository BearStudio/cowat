import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FieldInput } from "@/components/FieldInput";
import { FieldSelect } from "@/components/FieldSelect";
import { FieldHidden } from "@/components/FieldHidden";
import { Events } from "@prisma/client";
import { Icon } from "@/components/Icon";
import { Trash } from "lucide-react";
import {
  DESCRIPTION_BY_FIELD,
  isValidEvent,
  FIELDS_BY_EVENT,
} from "@/utils/subscriptions";
import { useFormFields } from "@formiz/core";
import { z } from "zod";

type EventQueryFieldsHelperProps = {
  event: Events;
};

const EventQueryFieldsHelper = ({ event }: EventQueryFieldsHelperProps) => {
  const returnFields = FIELDS_BY_EVENT[event];
  return (
    <>
      {returnFields.map((field, index) => (
        <Text key={index}>
          <span style={{ fontWeight: "bold" }}>{field}: </span>
          {DESCRIPTION_BY_FIELD[field as keyof typeof DESCRIPTION_BY_FIELD]}
        </Text>
      ))}
    </>
  );
};

type SubscriptionFormProps = {
  index: number;
  id?: string;
  onRemove: () => void;
};

export const SubscriptionForm = ({
  index,
  id,
  onRemove,
}: SubscriptionFormProps) => {
  const fields = useFormFields();
  const currentEvent = fields.subscriptions?.[index]?.triggeringEvent.value;
  return (
    <Stack>
      <FieldHidden name={`subscriptions[${index}].id`} defaultValue={id} />
      <FieldInput
        name={`subscriptions[${index}].name`}
        label="Name"
        placeholder="New subscription"
        required="Name is required"
        pt="2"
      />
      <FieldSelect
        id={`select-${index}`}
        label={"Event"}
        name={`subscriptions[${index}].triggeringEvent`}
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
        name={`subscriptions[${index}].url`}
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
      <Box pt="2">
        <Button
          variant="danger"
          leftIcon={<Icon icon={Trash} />}
          onClick={() => onRemove()}
        >
          Delete this subscription
        </Button>
      </Box>
    </Stack>
  );
};
