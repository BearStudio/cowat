import type { RouterOutputs } from "@/utils/api";
import { Box, Divider, HStack, IconButton } from "@chakra-ui/react";
import { FieldInput } from "@/components/FieldInput";
import { useForm, useRepeater } from "@formiz/core";
import { Fragment } from "react";
import { FieldSelect } from "@/components/FieldSelect";
import { FieldHidden } from "@/components/FieldHidden";
import { Events } from "@prisma/client";
import { AddPlaceholder } from "@/components/AddPlaceholder";
import { Icon } from "@/components/Icon";
import { Plus, Trash } from "lucide-react";

type Subscription =
  RouterOutputs["subscription"]["getAllSubscriptionsByUser"][number];

type SubscriptionFormProps = {
  index: number;
  id?: string;
  onRemove: () => void;
};

const SubscriptionForm = ({ index, id, onRemove }: SubscriptionFormProps) => {
  return (
    <HStack alignItems="start">
      <FieldHidden name={`subscriptions[${index}].id`} defaultValue={id} />
      <FieldSelect
        label={"Event"}
        name={`subscriptions[${index}].triggeringEvent`}
        placeholder="Please select an event"
        options={Object.keys(Events).map((event) => ({
          value: event,
          label: event,
        }))}
        required="Event is required"
      />
      <FieldInput
        name={`subscriptions[${index}].endpoint`}
        label="Endpoint"
        placeholder="https://my.webhook.com/listener"
        required="Endpoint is required"
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
