import type { RouterOutputs } from "@/utils/api";
import {
  Alert,
  AlertDescription,
  Box,
  Divider,
  HStack,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { FieldInput } from "@/components/FieldInput";
import { useForm, useRepeater } from "@formiz/core";
import { Fragment, useState } from "react";
import { FieldSelect } from "@/components/FieldSelect";
import { FieldHidden } from "@/components/FieldHidden";
import { Events } from "@prisma/client";
import { AddPlaceholder } from "@/components/AddPlaceholder";
import { Icon } from "@/components/Icon";
import { Info, Plus, Trash } from "lucide-react";
import {
  descriptionByField,
  isValidEvent,
  returnFieldsByEvent,
  urlRegex,
} from "@/utils/subscriptions";
import { isPattern } from "@formiz/validations";

type TooltipForEventProps = {
  event: Events;
};

const TooltipForEvent = ({ event }: TooltipForEventProps) => {
  const returnFields = returnFieldsByEvent[event];
  return (
    <>
      {returnFields.map((field, index) => (
        <Fragment key={index}>
          <strong>{field}: </strong>
          {descriptionByField[field as keyof typeof descriptionByField]}
          <br />
        </Fragment>
      ))}
    </>
  );
};

type Subscription =
  RouterOutputs["subscription"]["getAllSubscriptionsByUser"][number];

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
  const [showTooltip, setShowTooltip] = useState(false);
  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };
  const [selectEventValue, setSelectEventValue] = useState<string>(
    defaultEvent ?? ""
  );
  return (
    <>
      <HStack alignItems="start" spacing="1">
        <FieldHidden name={`subscriptions[${index}].id`} defaultValue={id} />
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
        <Box pt="10" pr="2" cursor="pointer" onClick={toggleTooltip}>
          <Tooltip label={`${showTooltip ? "Hide" : "Show"} return fields`}>
            <Info />
          </Tooltip>
        </Box>
        <FieldInput
          name={`subscriptions[${index}].endpoint`}
          label="Endpoint"
          placeholder="https://my.webhook.com/listener"
          required="Endpoint is required"
          validations={[
            {
              handler: isPattern(urlRegex),
              message: "Endpoint should be a valid url",
            },
          ]}
          pr="2"
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
      {showTooltip && isValidEvent(selectEventValue) && (
        <Alert variant="infoGray" borderRadius="md">
          <AlertDescription>
            <TooltipForEvent event={selectEventValue} />
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

type SubscriptionsFormProps = {
  defaultValues: Array<Subscription>;
};

export const SubscriptionsForm = ({
  defaultValues,
}: SubscriptionsFormProps) => {
  const form = useForm();
  const subscriptions = useRepeater({
    name: "subscriptions",
    connect: form,
    initialValues: defaultValues,
  });
  return (
    <>
      {subscriptions.keys.map((key, index) => {
        const subscriptionIndex = Number.isInteger(parseInt(key))
          ? parseInt(key)
          : index;
        return (
          <Fragment key={key}>
            <SubscriptionForm
              id={defaultValues[subscriptionIndex]?.id}
              index={index}
              defaultEvent={defaultValues[subscriptionIndex]?.triggeringEvent}
              onRemove={() => subscriptions.remove(index)}
            />
            <Divider />
          </Fragment>
        );
      })}
      <AddPlaceholder onClick={() => subscriptions.append()}>
        <Icon icon={Plus} /> Add Subscription
      </AddPlaceholder>
    </>
  );
};
