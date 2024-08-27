import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FieldInput } from "@/components/FieldInput";
import { Fragment, useState } from "react";
import { FieldSelect } from "@/components/FieldSelect";
import { FieldHidden } from "@/components/FieldHidden";
import { Events } from "@prisma/client";
import { Icon } from "@/components/Icon";
import { Trash } from "lucide-react";
import {
  descriptionByField,
  isValidEvent,
  returnFieldsByEvent,
  urlRegex,
} from "@/utils/subscriptions";
import { isPattern } from "@formiz/validations";

type HelperForEventProps = {
  event: Events;
};

const HelperForEvent = ({ event }: HelperForEventProps) => {
  const returnFields = returnFieldsByEvent[event];
  return (
    <>
      {returnFields.map((field, index) => (
        <Text key={index}>
          <span style={{ fontWeight: "bold" }}>{field}: </span>
          {descriptionByField[field as keyof typeof descriptionByField]}
        </Text>
      ))}
    </>
  );
};

type SubscriptionFormProps = {
  index: number;
  id?: string;
  defaultEvent?: Events;
  onRemove: () => void;
};

const SubscriptionForm = ({
  index,
  id,
  defaultEvent,
  onRemove,
}: SubscriptionFormProps) => {
  const [selectEventValue, setSelectEventValue] = useState<string>(
    defaultEvent ?? ""
  );
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
        onChange={(event) => setSelectEventValue(event.target.value)}
        options={Object.keys(Events).map((event) => ({
          value: event,
          label: event,
        }))}
        required="Event is required"
      />
      {isValidEvent(selectEventValue) && (
        <Alert variant="infoGray" borderRadius="md">
          <AlertDescription>
            <strong>
              Query for this event will contains the following fields:
            </strong>
            <br />
            <HelperForEvent event={selectEventValue} />
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
            handler: isPattern(urlRegex),
            message: "URL is not valid",
          },
        ]}
        pt="2"
      />
      <Box pt="2">
        <Button
          variant="danger"
          aria-label={`Remove stop ${index}`}
          leftIcon={<Icon icon={Trash} />}
          onClick={() => onRemove()}
        >
          Delete this subscription
        </Button>
      </Box>
    </Stack>
  );
};

export default SubscriptionForm;
